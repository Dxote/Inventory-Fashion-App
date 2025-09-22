import { useEffect, useState } from "react";
import api from "../utils/api";
import { HiOutlinePencil, HiOutlineTrash, HiOutlinePlus, HiOutlineEye } from "react-icons/hi";

interface Audit {
  id: number;
  user: { id: number; name: string; email: string } | null;
  action: string;
  entity: string;
  entityId: number | null;
  details: any;
  createdAt: string;
}

const AuditLog = () => {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [selectedDetail, setSelectedDetail] = useState<any>(null);

  useEffect(() => {
    const fetchAudits = async () => {
      try {
        const res = await api.get("/audit");
        setAudits(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAudits();
  }, []);

  const renderDetails = (detail: any) => {
  if (!detail) return "No details";

  if (typeof detail === "object") {
    return (
      <div>
  {detail.target && (
    <p>
      <strong>Target:</strong>{" "}
      {detail.target.name ?? `ID ${detail.target.id}`}{" "}
      ({detail.target.email ?? "-"})
    </p>
  )}

    {detail.changes && detail.changes.length > 0 && (
      <div className="mt-2">
        <strong>Changes:</strong>
        <ul className="list-disc ml-5">
          {detail.changes.map((c: any, i: number) => (
            <li key={i}>
              {c.field}: "{c.old}" → "{c.new}"
            </li>
          ))}
        </ul>
      </div>
    )}

    <p className="mt-2">
      <strong>Summary:</strong> {detail.summary ?? "No summary available"}
    </p>
  </div>
    );
  }

  return <p className="whitespace-pre-wrap">{detail}</p>;
};

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6 dark:text-whiteSecondary text-blackPrimary">
        Audit Logs
      </h2>
      <table className="w-full text-left text-sm border-collapse">
        <thead>
          <tr className="border-b border-gray-600">
            <th className="py-2 px-4">User</th>
            <th className="py-2 px-4">Action</th>
            <th className="py-2 px-4">Entity</th>
            <th className="py-2 px-4">Details</th>
            <th className="py-2 px-4"></th>
            <th className="py-2 px-4">Timestamp</th>
          </tr>
        </thead>
            <tbody>
      {audits.map((audit) => (
        <tr key={audit.id} className="border-b border-gray-700">
          <td className="py-2 px-4">
            {audit.user ? `${audit.user.name} (${audit.user.email})` : "System"}
          </td>
          <td className="py-2 px-4">{audit.action}</td>
          <td className="py-2 px-4">{audit.entity}</td>
          <td className="py-2 px-4 truncate max-w-[200px]">
            {audit.details?.summary ?? "No details"}
          </td>
          <td className="py-2 px-4">
            <HiOutlineEye />
            <button
              className="text-blue-500 underline"
              onClick={() => setSelectedDetail(audit.details)}
            >
              View Detail
            </button>
          </td>
          <td className="py-2 px-4">
            {new Date(audit.createdAt).toLocaleString()}
          </td>
        </tr>
      ))}
    </tbody>

      </table>

      {/* Modal Detail */}
      {selectedDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg max-w-lg w-full">
            <h3 className="text-lg font-bold mb-4">Audit Details</h3>
            {renderDetails(selectedDetail)}
            <button
              className="mt-6 px-4 py-2 bg-black text-white rounded hover:bg-gray-900"
              onClick={() => setSelectedDetail(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLog;