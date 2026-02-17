import { useState, useEffect } from 'react';

interface MasterVariable {
  master_var_id: number;
  var_name: string;
  var_description: string;
  var_type: 'text' | 'number' | 'date' | 'boolean' | 'select';
  var_options?: string;
  default_value: string;
  is_active: boolean;
}

interface UseMasterVariablesResult {
  variables: MasterVariable[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook to fetch master variables from the backend
 * Falls back gracefully if backend is unavailable
 */
export const useMasterVariables = (): UseMasterVariablesResult => {
  const [variables, setVariables] = useState<MasterVariable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVariables = async () => {
    setLoading(true);
    setError(null);

    const endpoints = [
      'http://127.0.0.1:8800',
      'http://localhost:8800',
      '/api' // Proxy endpoint
    ];

    for (const baseUrl of endpoints) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

        const response = await fetch(`${baseUrl}/master-variables`, {
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          setVariables(data);
          setLoading(false);
          return;
        }
      } catch (err) {
        // Continue to next endpoint
        continue;
      }
    }

    // If all endpoints fail, set empty array and continue
    console.warn('[Master Variables] Backend unavailable, continuing without master variables');
    setVariables([]);
    setError('Master variables unavailable');
    setLoading(false);
  };

  useEffect(() => {
    fetchVariables();
  }, []);

  return {
    variables,
    loading,
    error,
    refetch: fetchVariables
  };
};

/**
 * Merge master variables with template defaults
 * Master variables take precedence if they match template field names
 */
export const mergeMasterVariablesWithDefaults = (
  masterVariables: MasterVariable[],
  templateDefaults: Record<string, string | undefined>
): Record<string, string | undefined> => {
  const merged = { ...templateDefaults };

  // Convert master variable names to match template field format
  masterVariables.forEach(variable => {
    // Use hierarchical variable name directly (e.g., "entity.trading.name", "org.coordinator.phone")
    const varName = variable.var_name;
    
    // Check if any template field matches this variable
    Object.keys(templateDefaults).forEach(fieldKey => {
      // Direct match or normalized match
      if (fieldKey === varName) {
        merged[fieldKey] = variable.default_value || templateDefaults[fieldKey];
      } else {
        // Match by normalized name
        const normalizedFieldKey = fieldKey.toLowerCase().replace(/[._-]/g, '');
        const normalizedVarName = varName.toLowerCase().replace(/[._-]/g, '');
        
        if (normalizedFieldKey === normalizedVarName || 
            normalizedFieldKey.includes(normalizedVarName) || 
            normalizedVarName.includes(normalizedFieldKey)) {
          merged[fieldKey] = variable.default_value || templateDefaults[fieldKey];
        }
      }
    });
  });

  return merged;
};

/**
 * Get all master variables as additional template defaults
 * Uses hierarchical variable structure (e.g., "entity.trading.name", "org.coordinator.phone")
 */
export const getMasterVariablesAsDefaults = (
  masterVariables: MasterVariable[]
): Record<string, string> => {
  const defaults: Record<string, string> = {};

  masterVariables.forEach(variable => {
    // Use the variable name directly in hierarchical format
    defaults[variable.var_name] = variable.default_value;
  });

  return defaults;
};

/**
 * Get field metadata from master variables
 */
export const getFieldMetadata = (
  fieldKey: string,
  masterVariables: MasterVariable[]
): { description?: string; type?: string; options?: string[] } => {
  const normalizedFieldKey = fieldKey.toLowerCase().replace(/[._-]/g, '');
  
  const matchingVariable = masterVariables.find(variable => {
    const normalizedVarName = variable.var_name.toLowerCase().replace(/[._-]/g, '').replace(/^ref\d+/, '');
    return normalizedFieldKey.includes(normalizedVarName) || normalizedVarName.includes(normalizedFieldKey);
  });

  if (matchingVariable) {
    return {
      description: matchingVariable.var_description,
      type: matchingVariable.var_type,
      options: matchingVariable.var_options ? JSON.parse(matchingVariable.var_options) : undefined
    };
  }

  return {};
};
