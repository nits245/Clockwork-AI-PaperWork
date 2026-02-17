import db from "./db.js";

class ep_macros {
  // Tenant-aware query method
  async query(q, res, tenantId = null) {
    const sql = q;
    try {
      const data = await db.query(sql, [], tenantId);
      return res.json(data.rows);
    } catch (err) {
      console.error('Query error:', err);
      return res.status(500).send(err);
    }
  }

  // Legacy callback-style query (deprecated)
  queryLegacy(q, res) {
    const sql = q;
    db.query(sql, (err, data) => {
      if (err) return res.send(err);
      return res.json(data.rows);
    });
  }

  //craft a search string, automatically creating an OR statement for different columns to search
  //prefix: (optional else use "") the operator to put in front of the string WITH SPACES
  //search: the string to search for
  //inArgs: an array of column name strings to search in
  generate_search_string(prefix, search, inArgs) {
    var s = prefix;
    s += "(";
    for (var i in inArgs) {
      s += inArgs[i] + " LIKE '%" + search + "%'";
      if (i != inArgs.length - 1) s += " OR ";
    }
    s += ")";
    return s;
  }

  // Tenant-aware SELECT query
  // Automatically adds tenant_id to WHERE clause if tenantId provided
  async select(table, args, res, tenantId = null) {
    var q = "SELECT ";
    if (args.columns) q += args.columns;
    else q += "*";
    q += " FROM " + table;
    if (args.other) q += " " + args.other;
    
    // Build WHERE clause with tenant isolation
    let whereClause = args.where || "";
    if (tenantId) {
      if (whereClause) {
        whereClause = `(${whereClause}) AND tenant_id = '${tenantId}'`;
      } else {
        whereClause = `tenant_id = '${tenantId}'`;
      }
    }
    
    if (whereClause) q += " WHERE " + whereClause;
    if (args.groupBy) q += " GROUP BY " + args.groupBy;
    if (args.orderBy) q += " ORDER BY " + args.orderBy;

    try {
      const data = await db.query(q, [], tenantId);
      return res.json(data.rows);
    } catch (err) {
      console.error('Select error:', err);
      return res.status(500).send(err);
    }
  }

  // Legacy callback-style select (deprecated)
  selectLegacy(table, args, res) {
    var q = "SELECT ";
    if (args.columns) q += args.columns;
    else q += "*";
    q += " FROM " + table;
    if (args.other) q += " " + args.other;
    if (args.where) q += " WHERE " + args.where;
    if (args.groupBy) q += " GROUP BY " + args.groupBy;
    if (args.orderBy) q += " ORDER BY " + args.orderBy;

    db.query(q, (err, data) => {
      if (err) return res.send(err);
      return res.json(data.rows);
    });
  }
}

export default ep_macros;
