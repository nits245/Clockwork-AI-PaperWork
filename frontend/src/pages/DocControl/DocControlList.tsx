import React, { useState, useEffect } from "react";
import "./DocControlList.scss";

import partiesIcon from "../../img/docControl/partiesIcon.svg";
import reviewIcon from "../../img/docControl/reviewIcon.svg";
import sendIcon from "../../img/docControl/sendIcon.svg";
import greysendIcon from "../../img/docControl/greysendIcon.svg";
import lockIcon from "../../img/docControl/lockIcon.png";
import editIcon from "../../img/home/editIcon2.svg";
import DocModal from "./DocModal/DocModal";
import { Link, useParams } from "react-router-dom";
import GroupViewModal from "../../components/GroupViewModal/GroupViewModal";
import axios from "axios";

// Define types for the document data and metadata
interface DocumentItem {
  document_template_id: string;
  version: number;
  approvalRatio: number;
  created_date: string;
  date_modified?: string;
  issueDate?: string;
  title?: string;
}

interface Metadata {
  title: string;
}

interface DocControlListProps {
  data: DocumentItem[];
}

const DocControlList: React.FC<DocControlListProps> = ({ data }) => {
  // Initialize progress property for each item in the data
  const [updatedData, updateData] = useState<DocumentItem[]>(data);
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [itemData, setItemData] = useState<DocumentItem | null>(null);

  const [show, setShow] = useState<boolean>(false);
  const [viewOpen, setViewOpen] = useState<boolean>(false);
  const [dataWithProgress, setDataWithProgress] = useState<DocumentItem[]>(updatedData);
  const [dataVisible, setDataVisible] = useState<DocumentItem[]>(updatedData);
  const [expanded, setExpanded] = useState<boolean>(false);
  
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    updateData([...data].reverse());
    setDataWithProgress(updatedData);
    fetchParentMetadata();
  }, [data]);

  const fetchParentMetadata = async () => {
    try {
      const res = await axios.get(`${process.env.BACKEND_URL}/view-document/document-template/type/${id}`);
      setMetadata(res.data[0]);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    setDataVisible(
      expanded
        ? dataWithProgress
        : dataWithProgress.length === 0
        ? []
        : [dataWithProgress[0]]
    );
  }, [updatedData, dataWithProgress, expanded]);

  return (
    <>
      <div className="docControlHeader">
        <h3 className="templateName">TEMPLATE NAME</h3>
        <h3 className="templateCategory">CATEGORY</h3>
        <h3 className="templateAction">ACTION</h3>
      </div>

      <div className="docControlList">
        <div className="table">
          {data.map((item, index) => (
            <div key={index} className="table-row">
              <span className="template-name">
                {item.title || item.document_template_id}
              </span>
              <span className="template-category">
                {id?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'General'}
              </span>
              <div className="template-action">
                <span className="parties-icon">
                  {item.document_template_id && (
                    <img
                      src={partiesIcon}
                      alt="Parties Icon"
                      className="partiesicon"
                      onClick={() => {
                        setItemData(item);
                        setViewOpen((prev) => !prev);
                      }}
                    />
                  )}
                </span>
                <Link to={`/template-preview/${item.document_template_id}`} title="Preview Template">
                  <img
                    src={reviewIcon}
                    alt="Preview Template"
                    className="reviewicon"
                  />
                </Link>

                <span className="send-icon">
                  {item.approvalRatio < 1 ? (
                    <img
                      src={greysendIcon}
                      alt="Send Icon"
                      className="transsendicon"
                    />
                  ) : (
                    <img
                      src={sendIcon}
                      alt="Send Icon"
                      className="sendicon"
                      onClick={() => {
                        setItemData(item);
                        setShow((s) => !s);
                      }}
                    />
                  )}
                </span>
              </div>
            </div>
          ))}

          {itemData && (
            <>
              <DocModal
                show={show}
                setShow={setShow}
                title={itemData.title || ""}
                doc_id={itemData.document_template_id}
              />
              <GroupViewModal
                viewOpen={viewOpen}
                setViewOpen={setViewOpen}
                docId={itemData.document_template_id}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default DocControlList;