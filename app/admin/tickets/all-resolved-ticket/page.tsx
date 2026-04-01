"use client";
import { useEffect, useState } from "react";
import { BackNavigation } from "@/components/dashboard/back-navigation";
import { DataTable } from "@/components/dashboard/data-table";
import { TicketDrawer } from "@/components/admin/ticket-drawer";

const COLUMNS = [
  { key: "ticketId", label: "Ticket ID" },
  { key: "student", label: "Student" },
  { key: "category", label: "Category" },
  { key: "status", label: "Status" },
  { key: "assignedTo", label: "Assigned To" },
  { key: "date", label: "Date" },
];

export default function AllResolvedTicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    fetch("/api/admin/support?status=RESOLVED")
      .then((r) => r.json())
      .then((d) => { setTickets(formatTickets(d.tickets || d || [])); })
      .catch(() => setTickets([]))
      .finally(() => setLoading(false));
  }, []);

  const formatTickets = (raw: any[]) =>
    raw.map((t: any) => ({
      id: t.id,
      ticketId: t.ticketId || `TKT-${t.id?.slice(-6).toUpperCase()}`,
      student: t.user ? `${t.user.firstName} ${t.user.lastName}` : "—",
      category: t.category || "General",
      status: t.status,
      assignedTo: t.assignedTo || "Unassigned",
      date: t.createdAt ? new Date(t.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—",
      _raw: t,
    }));

  const handleRowClick = async (row: any) => {
    try {
      const res = await fetch(`/api/admin/support/${row.id}`);
      const data = await res.json();
      setSelected(data.ticket || data);
    } catch {
      setSelected(row._raw);
    }
    setDrawerOpen(true);
  };

  return (
    <div className="bg-[#F6F6F6] p-4 md:p-6 min-h-full">
      <BackNavigation href="/admin/support" label="Back to Dashboard" />
      <div className="mt-6">
        <DataTable
          title="Resolved Tickets"
          columns={COLUMNS}
          data={tickets}
          isLoading={loading}
          searchable
          onRowClick={handleRowClick}
        />
      </div>
      <TicketDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} ticket={selected} />
    </div>
  );
}
