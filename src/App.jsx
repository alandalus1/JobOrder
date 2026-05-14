import { useEffect, useMemo, useRef, useState } from "react";

const demoCustomers = [
  {
    id: "CUST-001",
    name: "Al Hadaf Cleaning",
    phone: "5500 1122",
    email: "",
    address: "Doha",
    notes: "Regular customer",
  },
  {
    id: "CUST-002",
    name: "La Bella Gold & Diamonds",
    phone: "6642 9911",
    email: "",
    address: "Doha",
    notes: "Jewellery items",
  },
];

const emptyItem = () => ({
  jobKind: "",
  qty: "",
  pages: "",
  colours: "",
  startNo: "",
  size: "",
  paper: "",
  paperSize: "",
  finalSize: "",
  paperQty: "",
  screenshot: "",
  screenshotOrientation: "",
});

const emptyOrder = {
  customer: "",
  phone: "",
  description: "",
  date: "",
  deliveryDate: "",
  invoiceNo: "",
  totalAmount: "",
  advance: "",
  balance: "",
  specialNotes: "",
  machine: "GTO",
  machineSize: "64x90",
  laminationType: "None",
  status: "Pending",
  finishing: {
    uv: false,
    lamination: false,
    pasting: false,
    creasing: false,
    halfCutting: false,
  },
  items: [emptyItem()],
};

const demoOrders = [
  {
    id: "JO-1001",
    date: "2026-03-19",
    customer: "Al Hadaf Cleaning",
    phone: "5500 1122",
    description: "Business cards and flyers",
    deliveryDate: "2026-03-22",
    invoiceNo: "INV-3001",
    estimateNo: "EST-2001",
    totalAmount: 450,
    advance: 200,
    balance: 250,
    specialNotes: "Arabic + English",
    machine: "GTO",
    machineSize: "64x90",
    laminationType: "Matt",
    status: "In Production",
    finishing: {
      uv: false,
      lamination: true,
      pasting: false,
      creasing: false,
      halfCutting: false,
    },
    items: [
      {
        jobKind: "Business Cards",
        qty: "5000",
        pages: "2",
        colours: "4+4",
        startNo: "",
        size: "9x5 cm",
        paper: "350gsm Art Card",
        paperSize: "64x90",
        finalSize: "9x5 cm",
        paperQty: "8 ريم",
      },
      {
        jobKind: "Flyers",
        qty: "2000",
        pages: "2",
        colours: "4+4",
        startNo: "",
        size: "A5",
        paper: "150gsm Art",
        paperSize: "64x90",
        finalSize: "A5",
        paperQty: "3 ريم",
      },
    ],
  },
];

const emptyCustomer = {
  name: "",
  phone: "",
  email: "",
  address: "",
  notes: "",
};

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function monthStr() {
  return new Date().toISOString().slice(0, 7);
}

function money(v) {
  return `QR ${Number(v || 0).toFixed(2)}`;
}

function nextNumber(prefix, items, key, start) {
  const nums = items.map((x) => {
    const value = String(x[key] || "").replace(prefix, "");
    const n = Number(value);
    return Number.isFinite(n) ? n : start;
  });
  const max = nums.length ? Math.max(start, ...nums) : start;
  return `${prefix}${max + 1}`;
}

function statusColor(status) {
  if (status === "Pending") return "#f59e0b";
  if (status === "In Design") return "#0ea5e9";
  if (status === "In Production") return "#8b5cf6";
  if (status === "Ready") return "#10b981";
  if (status === "Delivered") return "#64748b";
  return "#64748b";
}

function StatusBadge({ status }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "6px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        color: "#fff",
        background: statusColor(status),
      }}
    >
      {status}
    </span>
  );
}

function SummaryCard({ title, value, subtext }) {
  return (
    <div className="card">
      <div style={{ fontSize: 13, color: "#64748b", marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>{value}</div>
      <div style={{ fontSize: 12, color: "#94a3b8" }}>{subtext}</div>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState("dashboard");

  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem("aa_orders_v4");
    return saved ? JSON.parse(saved) : demoOrders;
  });

  const [customers, setCustomers] = useState(() => {
    const saved = localStorage.getItem("aa_customers_v4");
    return saved ? JSON.parse(saved) : demoCustomers;
  });

  const [company, setCompany] = useState(() => {
    const saved = localStorage.getItem("aa_company_v4");
    return saved
      ? JSON.parse(saved)
      : {
          name: "Al Andalus Printing Press",
          tagline: "Design • Print • Finish",
          address: "Doha, Qatar",
          phone: "+974 0000 0000",
        };
  });

  const [orderForm, setOrderForm] = useState({
    ...emptyOrder,
    date: todayStr(),
  });
  const [editingOrderId, setEditingOrderId] = useState("");

  const [customerForm, setCustomerForm] = useState(emptyCustomer);
  const [editingCustomerId, setEditingCustomerId] = useState("");

  const [search, setSearch] = useState("");
  const [mobileSearch, setMobileSearch] = useState("");
  const [monthFilter, setMonthFilter] = useState(monthStr());
  const [bilingualPrint, setBilingualPrint] = useState(true);

  const fileInputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("aa_orders_v4", JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem("aa_customers_v4", JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem("aa_company_v4", JSON.stringify(company));
  }, [company]);

  useEffect(() => {
    const total = Number(orderForm.totalAmount || 0);
    const advance = Number(orderForm.advance || 0);
    const balance = total - advance;
    setOrderForm((prev) => ({
      ...prev,
      balance: String(balance >= 0 ? balance : 0),
    }));
  }, [orderForm.totalAmount, orderForm.advance]);

  const totals = useMemo(() => {
    const totalOrders = orders.length;
    const pending = orders.filter((o) =>
      ["Pending", "In Design", "In Production"].includes(o.status)
    ).length;
    const ready = orders.filter((o) => o.status === "Ready").length;
    const delivered = orders.filter((o) => o.status === "Delivered").length;
    const revenue = orders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
    const advance = orders.reduce((sum, o) => sum + Number(o.advance || 0), 0);

    return {
      totalOrders,
      pending,
      ready,
      delivered,
      revenue,
      advance,
      balance: revenue - advance,
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return orders;

    return orders.filter((o) =>
      [
        o.id,
        o.invoiceNo,
        o.estimateNo,
        o.customer,
        o.phone,
        o.description,
        o.specialNotes,
        o.status,
        ...(o.items || []).flatMap((i) => [
          i.jobKind,
          i.qty,
          i.pages,
          i.colours,
          i.startNo,
          i.size,
          i.paper,
          i.paperSize,
          i.finalSize,
          i.paperQty,
        ]),
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [orders, search]);

  const phoneResults = useMemo(() => {
    const q = mobileSearch.replace(/\s+/g, "").toLowerCase();
    if (!q) return orders;
    return orders.filter((o) =>
      String(o.phone || "").replace(/\s+/g, "").toLowerCase().includes(q)
    );
  }, [orders, mobileSearch]);

  const monthlyOrders = useMemo(() => {
    return orders.filter((o) => String(o.date || "").slice(0, 7) === monthFilter);
  }, [orders, monthFilter]);

  const monthlyTotals = useMemo(() => {
    const revenue = monthlyOrders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
    const advance = monthlyOrders.reduce((sum, o) => sum + Number(o.advance || 0), 0);
    return {
      count: monthlyOrders.length,
      revenue,
      advance,
      balance: revenue - advance,
    };
  }, [monthlyOrders]);

  const customerRows = useMemo(() => {
    return customers.map((c) => {
      const related = orders.filter(
        (o) => o.customer === c.name || (c.phone && o.phone === c.phone)
      );
      const totalAmount = related.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
      const balance = related.reduce(
        (sum, o) => sum + (Number(o.totalAmount || 0) - Number(o.advance || 0)),
        0
      );
      return {
        ...c,
        totalOrders: related.length,
        totalAmount,
        balance,
      };
    });
  }, [customers, orders]);

  function resetOrderForm() {
    setOrderForm({
      ...emptyOrder,
      date: todayStr(),
    });
    setEditingOrderId("");
  }

  function resetCustomerForm() {
    setCustomerForm(emptyCustomer);
    setEditingCustomerId("");
  }

  function updateOrderField(key, value) {
    setOrderForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateFinishingField(key, value) {
    setOrderForm((prev) => ({
      ...prev,
      finishing: {
        ...prev.finishing,
        [key]: value,
      },
    }));
  }

  function updateItem(index, key, value) {
    setOrderForm((prev) => {
      const items = [...prev.items];
      items[index] = { ...items[index], [key]: value };
      return { ...prev, items };
    });
  }

  function handleScreenshotUpload(index, event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const MAX_DIM = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height && width > MAX_DIM) {
          height *= MAX_DIM / width;
          width = MAX_DIM;
        } else if (height > width && height > MAX_DIM) {
          width *= MAX_DIM / height;
          height = MAX_DIM;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        const orientation = width > height ? "landscape" : "portrait";

        setOrderForm((prev) => {
          const items = [...prev.items];
          items[index] = { ...items[index], screenshot: dataUrl, screenshotOrientation: orientation };
          return { ...prev, items };
        });
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function addItem() {
    setOrderForm((prev) => {
      if (prev.items.length >= 10) {
        alert("Maximum 10 items only");
        return prev;
      }
      return { ...prev, items: [...prev.items, emptyItem()] };
    });
  }

  function removeItem(index) {
    setOrderForm((prev) => {
      if (prev.items.length === 1) {
        return { ...prev, items: [emptyItem()] };
      }
      return { ...prev, items: prev.items.filter((_, i) => i !== index) };
    });
  }

  function addOrUpdateOrder() {
    if (!orderForm.customer || !orderForm.phone) {
      alert("Please fill customer name and mobile number");
      return;
    }

    const validItems = orderForm.items.filter(
      (item) =>
        item.jobKind ||
        item.qty ||
        item.pages ||
        item.colours ||
        item.paper ||
        item.finalSize
    );

    if (validItems.length === 0) {
      alert("Please add at least one item");
      return;
    }

    if (editingOrderId) {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === editingOrderId
            ? {
                ...o,
                ...orderForm,
                totalAmount: Number(orderForm.totalAmount || 0),
                advance: Number(orderForm.advance || 0),
                balance: Number(orderForm.balance || 0),
                items: validItems,
              }
            : o
        )
      );
      resetOrderForm();
      setView("orders");
      return;
    }

    const newOrder = {
      id: nextNumber("JO-", orders, "id", 1000),
      invoiceNo: orderForm.invoiceNo || nextNumber("INV-", orders, "invoiceNo", 3000),
      estimateNo: nextNumber("EST-", orders, "estimateNo", 2000),
      date: orderForm.date || todayStr(),
      customer: orderForm.customer,
      phone: orderForm.phone,
      description: orderForm.description,
      deliveryDate: orderForm.deliveryDate,
      totalAmount: Number(orderForm.totalAmount || 0),
      advance: Number(orderForm.advance || 0),
      balance: Number(orderForm.balance || 0),
      specialNotes: orderForm.specialNotes,
      machine: orderForm.machine,
      machineSize: orderForm.machineSize,
      laminationType: orderForm.laminationType,
      status: orderForm.status,
      finishing: orderForm.finishing,
      items: validItems,
    };

    setOrders((prev) => [newOrder, ...prev]);

    const exists = customers.some(
      (c) =>
        c.name.toLowerCase() === orderForm.customer.toLowerCase() ||
        (orderForm.phone && c.phone === orderForm.phone)
    );

    if (!exists) {
      setCustomers((prev) => [
        {
          id: `CUST-${String(prev.length + 1).padStart(3, "0")}`,
          name: orderForm.customer,
          phone: orderForm.phone,
          email: "",
          address: "",
          notes: "Auto-created from order",
        },
        ...prev,
      ]);
    }

    resetOrderForm();
    setView("orders");
  }

  function editOrder(order) {
    setEditingOrderId(order.id);
    setOrderForm({
      customer: order.customer || "",
      phone: order.phone || "",
      description: order.description || "",
      date: order.date || todayStr(),
      deliveryDate: order.deliveryDate || "",
      invoiceNo: order.invoiceNo || "",
      totalAmount: String(order.totalAmount || ""),
      advance: String(order.advance || ""),
      balance: String(order.balance || ""),
      specialNotes: order.specialNotes || "",
      machine: order.machine || "GTO",
      machineSize: order.machineSize || "64x90",
      laminationType: order.laminationType || "None",
      status: order.status || "Pending",
      finishing: {
        uv: !!order.finishing?.uv,
        lamination: !!order.finishing?.lamination,
        pasting: !!order.finishing?.pasting,
        creasing: !!order.finishing?.creasing,
        halfCutting: !!order.finishing?.halfCutting,
      },
      items: order.items?.length ? order.items : [emptyItem()],
    });
    setView("new");
  }

  function deleteOrder(id) {
    if (!window.confirm("Delete this order?")) return;
    setOrders((prev) => prev.filter((o) => o.id !== id));
    if (editingOrderId === id) resetOrderForm();
  }

  function updateOrderStatus(id, status) {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  }

  function quickFillCustomer(name) {
    const c = customers.find((x) => x.name === name);
    setOrderForm((prev) => ({
      ...prev,
      customer: c ? c.name : name,
      phone: c ? c.phone || "" : prev.phone,
    }));
  }

  function addOrUpdateCustomer() {
    if (!customerForm.name) {
      alert("Please enter customer name");
      return;
    }

    if (editingCustomerId) {
      setCustomers((prev) =>
        prev.map((c) => (c.id === editingCustomerId ? { ...c, ...customerForm } : c))
      );
      resetCustomerForm();
      return;
    }

    setCustomers((prev) => [
      {
        id: `CUST-${String(prev.length + 1).padStart(3, "0")}`,
        ...customerForm,
      },
      ...prev,
    ]);
    resetCustomerForm();
  }

  function editCustomer(c) {
    setEditingCustomerId(c.id);
    setCustomerForm({
      name: c.name || "",
      phone: c.phone || "",
      email: c.email || "",
      address: c.address || "",
      notes: c.notes || "",
    });
  }

  function deleteCustomer(id) {
    if (!window.confirm("Delete this customer?")) return;
    setCustomers((prev) => prev.filter((c) => c.id !== id));
  }

  function exportBackup() {
    const data = {
      version: "V4 Multi Item",
      exportedAt: new Date().toISOString(),
      company,
      customers,
      orders,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `al-andalus-backup-${todayStr()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function importBackup(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(String(e.target?.result || "{}"));
        if (data.company) setCompany(data.company);
        if (data.customers) setCustomers(data.customers);
        if (data.orders) setOrders(data.orders);
        alert("Backup restored");
      } catch {
        alert("Invalid backup file");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  }

  function resetDemoData() {
    if (!window.confirm("Reset all data to demo records?")) return;
    setOrders(demoOrders);
    setCustomers(demoCustomers);
    setCompany({
      name: "Al Andalus Printing Press",
      tagline: "Design • Print • Finish",
      address: "Doha, Qatar",
      phone: "+974 0000 0000",
    });
    resetOrderForm();
    resetCustomerForm();
  }

  function printDocument(order) {
    const title = "JOB ORDER";
    const arabic = "أمر تشغيل";

    const maxItems = 10;
    const items = [...(order.items || [])];
    while (items.length < maxItems) items.push(emptyItem());

    const win = window.open("", "_blank", "width=1200,height=900");
    if (!win) return;

    const itemColumns = items
      .map(
        (item, index) => `
          <th>${index + 1}</th>
        `
      )
      .join("");

    function row(labelEn, labelAr, key) {
      return `
        <tr>
          <td class="labelCell">
            <div>${labelEn}</div>
            <div class="ar-sm">${labelAr}</div>
          </td>
          ${items
            .map((item) => `<td>${item[key] || ""}</td>`)
            .join("")}
        </tr>
      `;
    }

    win.document.write(`
      <html>
        <head>
          <title>Job Order - ${order.id}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #111; }
            .top { display:flex; justify-content:space-between; align-items:flex-start; gap:20px; }
            .titleWrap { text-align:center; flex:1; }
            .title { font-size: 34px; font-weight: bold; }
            .title2 { font-size: 26px; font-weight: bold; text-decoration: underline; }
            .ar { font-size: 20px; font-weight:bold; }
            .ar-sm { font-size: 11px; color:#333; }
            .lineRow { display:flex; justify-content:space-between; gap:20px; margin:10px 0; }
            .lineField { flex:1; font-size:14px; }
            .dots { border-bottom:1px dotted #555; display:inline-block; min-width:180px; height:18px; vertical-align:bottom; }
            table { width:100%; border-collapse:collapse; margin-top:12px; }
            th, td { border:1px solid #555; padding:6px; font-size:12px; text-align:center; vertical-align:middle; }
            .labelCell { text-align:left; width:120px; font-weight:bold; }
            .notes { border:1px solid #555; min-height:70px; padding:8px; margin-top:8px; }
            .finish { display:flex; gap:16px; flex-wrap:wrap; margin:12px 0; font-size:13px; }
            .box { display:inline-block; width:16px; height:16px; border:1px solid #444; text-align:center; line-height:14px; margin-right:4px; }
            .bottomRow { display:flex; justify-content:space-between; gap:20px; margin-top:12px; font-size:14px; }
            .signs { display:grid; grid-template-columns:1fr 1fr 1fr; gap:40px; margin-top:28px; text-align:center; font-size:13px; }
            .signLine { border-top:1px solid #333; padding-top:8px; }
            .smallBox { display:inline-block; min-width:60px; border:1px solid #444; padding:3px 8px; text-align:center; margin-left:6px; }
            .screenshot-page {
              page-break-before: always;
              width: 100%;
              height: 95vh;
              display: flex;
              justify-content: center;
              align-items: center;
              flex-direction: column;
            }
            .screenshot-img {
              max-width: 100%;
              max-height: 90%;
              object-fit: contain;
              border: 1px solid #ccc;
            }
            @media print {
              @page portrait-page { size: portrait; }
              @page landscape-page { size: landscape; }
              .page-portrait { page: portrait-page; }
              .page-landscape { page: landscape-page; }
            }
          </style>
        </head>
        <body>
          <div class="top">
            <div style="width:180px;">No. <span class="dots">${order.id}</span></div>
            <div class="titleWrap">
              ${bilingualPrint ? `<div class="ar">${arabic}</div>` : ""}
              <div class="title2">${title}</div>
            </div>
            <div style="width:260px; text-align:right;">
              ${bilingualPrint ? `التاريخ` : "Date"} :
              <span class="dots">${order.date || ""}</span>
            </div>
          </div>

          <div class="lineRow" style="margin-top:14px;">
            <div class="lineField">
              <strong>Customer Name</strong> : <span class="dots">${order.customer || ""}</span>
            </div>
            <div class="lineField" style="text-align:right;">
              ${bilingualPrint ? `اسم العميل` : ""}
            </div>
          </div>

          <div class="lineRow">
            <div class="lineField">
              <strong>Mobile No.</strong> : <span class="dots">${order.phone || ""}</span>
            </div>
            <div class="lineField" style="text-align:right;">
              ${bilingualPrint ? `جوال` : ""}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th class="labelCell"></th>
                ${itemColumns}
              </tr>
            </thead>
            <tbody>
              ${row("Job Kind", "اسم المطبوعات", "jobKind")}
              ${row("Qty", "الكمية", "qty")}
              ${row("Pages", "الصفحات", "pages")}
              ${row("Colours", "الألوان", "colours")}
              ${row("Start No", "الترقيم", "startNo")}
              ${row("Size", "المقاس", "size")}
              ${row("Paper", "الورق", "paper")}
              ${row("Paper Size", "مقاس الطبع", "paperSize")}
              ${row("Final Size", "المقاس الأخير", "finalSize")}
              ${row("Paper Qty.", "كمية الورق", "paperQty")}
            </tbody>
          </table>

          <div class="finish">
            <div><span class="box">${order.finishing?.uv ? "✓" : ""}</span> UV</div>
            <div><span class="box">${order.finishing?.lamination ? "✓" : ""}</span> Lamination</div>
            <div><span class="smallBox">${order.laminationType || ""}</span></div>
            <div><span class="box">${order.finishing?.pasting ? "✓" : ""}</span> Pasting</div>
            <div><span class="box">${order.finishing?.creasing ? "✓" : ""}</span> Creasing</div>
            <div><span class="box">${order.finishing?.halfCutting ? "✓" : ""}</span> Half Cutting</div>
          </div>

          <div style="font-weight:bold; margin-top:6px;">Special Notes</div>
          <div class="notes">${order.specialNotes || ""}</div>

          <div style="margin-top:10px; text-align:center;">
            <span class="smallBox">${order.machine || ""}</span>
            <span class="smallBox">${order.machineSize || ""}</span>
          </div>

          <div class="lineRow" style="margin-top:14px;">
            <div class="lineField">
              <strong>Description</strong> : <span class="dots">${order.description || ""}</span>
            </div>
          </div>

          <div class="bottomRow">
            <div><strong>Delivery Date</strong> : <span class="dots">${order.deliveryDate || ""}</span></div>
            <div><strong>Invoice No.</strong> : <span class="dots">${order.invoiceNo || ""}</span></div>
          </div>

          <div class="bottomRow">
            <div><strong>Total Amount</strong> : <span class="dots">${order.totalAmount || ""}</span></div>
            <div><strong>Advance</strong> : <span class="dots">${order.advance || ""}</span></div>
            <div><strong>Balance</strong> : <span class="dots">${order.balance || ""}</span></div>
          </div>

          <div class="signs">
            <div class="signLine">Supervisor Signature</div>
            <div class="signLine">Manager Signature</div>
            <div class="signLine">Accountant Signature</div>
          </div>

          ${items
            .map((item, idx) => item.screenshot ? `
              <div class="screenshot-page ${item.screenshotOrientation === 'landscape' ? 'page-landscape' : 'page-portrait'}">
                <h3 style="margin: 0 0 10px 0;">Item ${idx + 1} Screenshot - ${order.id}</h3>
                <img src="${item.screenshot}" class="screenshot-img" />
              </div>
            ` : "")
            .join("")}

          <script>
            window.onload = () => window.print();
          </script>
        </body>
      </html>
    `);

    win.document.close();
  }

  const recentOrders = [...orders]
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))
    .slice(0, 5);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brandBox">
          <div className="brandIcon">AA</div>
          <div>
            <div className="brandTitle">Al Andalus</div>
            <div className="brandSub">Printing Press V4</div>
          </div>
        </div>

        <button className={navBtn(view === "dashboard")} onClick={() => setView("dashboard")}>
          Dashboard
        </button>
        <button className={navBtn(view === "orders")} onClick={() => setView("orders")}>
          Orders
        </button>
        <button className={navBtn(view === "new")} onClick={() => setView("new")}>
          New / Edit
        </button>
        <button className={navBtn(view === "customers")} onClick={() => setView("customers")}>
          Customers
        </button>
        <button className={navBtn(view === "reports")} onClick={() => setView("reports")}>
          Reports
        </button>
        <button className={navBtn(view === "printables")} onClick={() => setView("printables")}>
          Printables
        </button>
        <button className={navBtn(view === "backup")} onClick={() => setView("backup")}>
          Backup
        </button>
      </aside>

      <main className="mainArea">
        <div className="topHeader">
          <div>
            <h1 style={{ margin: 0 }}>{company.name}</h1>
            <div style={{ color: "#64748b", marginTop: 6 }}>
              Multi-item job order software with up to 10 items
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button className="primaryBtn" onClick={() => setView("new")}>
              + New Job
            </button>
            <button className="secondaryBtn" onClick={exportBackup}>
              Backup
            </button>
          </div>
        </div>

        {view === "dashboard" && (
          <>
            <div className="grid6">
              <SummaryCard title="Total Orders" value={totals.totalOrders} subtext="All jobs" />
              <SummaryCard title="Queue" value={totals.pending} subtext="Pending + production" />
              <SummaryCard title="Ready" value={totals.ready} subtext="Ready jobs" />
              <SummaryCard title="Delivered" value={totals.delivered} subtext="Completed jobs" />
              <SummaryCard title="Revenue" value={money(totals.revenue)} subtext="Total value" />
              <SummaryCard title="Balance Due" value={money(totals.balance)} subtext="To collect" />
            </div>

            <div className="twoCol">
              <div className="card">
                <h3 style={{ marginTop: 0 }}>Recent Orders</h3>
                {recentOrders.map((order) => (
                  <div key={order.id} className="listRow">
                    <div>
                      <div style={{ fontWeight: 700 }}>
                        {order.id} • {order.customer}
                      </div>
                      <div className="mutedText">
                        {order.items?.length || 0} items • {order.date}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <StatusBadge status={order.status} />
                      <button
                        className="secondaryBtn smallBtn"
                        onClick={() => printDocument(order)}
                      >
                        Print
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="card">
                <h3 style={{ marginTop: 0 }}>Search by Mobile Number</h3>
                <input
                  value={mobileSearch}
                  onChange={(e) => setMobileSearch(e.target.value)}
                  placeholder="Type mobile number"
                />
                <div style={{ marginTop: 14, maxHeight: 350, overflow: "auto" }}>
                  {phoneResults.slice(0, 10).map((order) => (
                    <div key={order.id} className="miniCard">
                      <div style={{ fontWeight: 700 }}>{order.customer}</div>
                      <div className="mutedText">{order.phone || "—"}</div>
                      <div className="mutedText">
                        {order.id} • {order.items?.length || 0} items
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {view === "orders" && (
          <>
            <div className="card">
              <h3 style={{ marginTop: 0 }}>Search Orders</h3>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search job no, invoice no, customer, item, phone or notes"
              />
            </div>

            <div className="card">
              <h3 style={{ marginTop: 0 }}>Job Order List</h3>
              <div className="tableWrap">
                <table className="aaTable">
                  <thead>
                    <tr>
                      <th>Job</th>
                      <th>Invoice</th>
                      <th>Date</th>
                      <th>Customer</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Balance</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan="9" style={{ textAlign: "center", padding: 20 }}>
                          No orders found
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => (
                        <tr key={order.id}>
                          <td>{order.id}</td>
                          <td>{order.invoiceNo}</td>
                          <td>{order.date}</td>
                          <td>
                            <div style={{ fontWeight: 700 }}>{order.customer}</div>
                            <div className="mutedText">{order.phone || "—"}</div>
                          </td>
                          <td>{order.items?.length || 0}</td>
                          <td>{money(order.totalAmount)}</td>
                          <td>{money(order.balance)}</td>
                          <td>
                            <select
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            >
                              <option>Pending</option>
                              <option>In Design</option>
                              <option>In Production</option>
                              <option>Ready</option>
                              <option>Delivered</option>
                            </select>
                            <div style={{ marginTop: 8 }}>
                              <StatusBadge status={order.status} />
                            </div>
                          </td>
                          <td>
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                              <button
                                className="secondaryBtn smallBtn"
                                onClick={() => editOrder(order)}
                              >
                                Edit
                              </button>
                              <button
                                className="secondaryBtn smallBtn"
                                onClick={() => printDocument(order)}
                              >
                                Print
                              </button>
                              <button
                                className="dangerBtn smallBtn"
                                onClick={() => deleteOrder(order.id)}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {view === "new" && (
          <div className="card">
            <h3 style={{ marginTop: 0 }}>
              {editingOrderId ? `Edit ${editingOrderId}` : "Create New Job Order"}
            </h3>

            <div className="formGrid4">
              <div>
                <label>Customer Name</label>
                <input
                  list="customer-list"
                  value={orderForm.customer}
                  onChange={(e) => updateOrderField("customer", e.target.value)}
                />
                <datalist id="customer-list">
                  {customers.map((c) => (
                    <option key={c.id} value={c.name} />
                  ))}
                </datalist>
              </div>

              <div>
                <label>Mobile No.</label>
                <input
                  value={orderForm.phone}
                  onChange={(e) => updateOrderField("phone", e.target.value)}
                />
              </div>

              <div>
                <label>Date</label>
                <input
                  type="date"
                  value={orderForm.date}
                  onChange={(e) => updateOrderField("date", e.target.value)}
                />
              </div>

              <div>
                <label>Delivery Date</label>
                <input
                  type="date"
                  value={orderForm.deliveryDate}
                  onChange={(e) => updateOrderField("deliveryDate", e.target.value)}
                />
              </div>

              <div>
                <label>Invoice No.</label>
                <input
                  value={orderForm.invoiceNo}
                  onChange={(e) => updateOrderField("invoiceNo", e.target.value)}
                />
              </div>

              <div>
                <label>Description</label>
                <input
                  value={orderForm.description}
                  onChange={(e) => updateOrderField("description", e.target.value)}
                />
              </div>

              <div>
                <label>Total Amount</label>
                <input
                  value={orderForm.totalAmount}
                  onChange={(e) => updateOrderField("totalAmount", e.target.value)}
                />
              </div>

              <div>
                <label>Advance</label>
                <input
                  value={orderForm.advance}
                  onChange={(e) => updateOrderField("advance", e.target.value)}
                />
              </div>

              <div>
                <label>Balance</label>
                <input value={orderForm.balance} readOnly />
              </div>

              <div>
                <label>Machine</label>
                <input
                  value={orderForm.machine}
                  onChange={(e) => updateOrderField("machine", e.target.value)}
                />
              </div>

              <div>
                <label>Machine Size</label>
                <input
                  value={orderForm.machineSize}
                  onChange={(e) => updateOrderField("machineSize", e.target.value)}
                />
              </div>

              <div>
                <label>Status</label>
                <select
                  value={orderForm.status}
                  onChange={(e) => updateOrderField("status", e.target.value)}
                >
                  <option>Pending</option>
                  <option>In Design</option>
                  <option>In Production</option>
                  <option>Ready</option>
                  <option>Delivered</option>
                </select>
              </div>
            </div>

            <div className="card innerCard" style={{ marginTop: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <h3 style={{ margin: 0 }}>Job Items</h3>
                <button className="primaryBtn smallBtn" onClick={addItem}>
                  + Add Item
                </button>
              </div>

              {orderForm.items.map((item, index) => (
                <div key={index} className="itemBox">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <strong>Item {index + 1}</strong>
                    <button
                      className="dangerBtn smallBtn"
                      type="button"
                      onClick={() => removeItem(index)}
                    >
                      Remove
                    </button>
                  </div>

                  <div className="formGrid5">
                    <div>
                      <label>Job Kind</label>
                      <input value={item.jobKind} onChange={(e) => updateItem(index, "jobKind", e.target.value)} />
                    </div>
                    <div>
                      <label>Qty</label>
                      <input value={item.qty} onChange={(e) => updateItem(index, "qty", e.target.value)} />
                    </div>
                    <div>
                      <label>Pages</label>
                      <input value={item.pages} onChange={(e) => updateItem(index, "pages", e.target.value)} />
                    </div>
                    <div>
                      <label>Colours</label>
                      <input value={item.colours} onChange={(e) => updateItem(index, "colours", e.target.value)} />
                    </div>
                    <div>
                      <label>Start No</label>
                      <input value={item.startNo} onChange={(e) => updateItem(index, "startNo", e.target.value)} />
                    </div>
                    <div>
                      <label>Size</label>
                      <input value={item.size} onChange={(e) => updateItem(index, "size", e.target.value)} />
                    </div>
                    <div>
                      <label>Paper</label>
                      <input value={item.paper} onChange={(e) => updateItem(index, "paper", e.target.value)} />
                    </div>
                    <div>
                      <label>Paper Size</label>
                      <input value={item.paperSize} onChange={(e) => updateItem(index, "paperSize", e.target.value)} />
                    </div>
                    <div>
                      <label>Final Size</label>
                      <input value={item.finalSize} onChange={(e) => updateItem(index, "finalSize", e.target.value)} />
                    </div>
                    <div>
                      <label>Paper Qty</label>
                      <input value={item.paperQty} onChange={(e) => updateItem(index, "paperQty", e.target.value)} />
                    </div>
                  </div>

                  <div style={{ marginTop: 12, display: "flex", gap: 10, alignItems: "center" }}>
                    <label style={{ margin: 0, fontSize: 13, fontWeight: "bold" }}>Screenshot</label>
                    <input type="file" accept="image/*" onChange={(e) => handleScreenshotUpload(index, e)} />
                    {item.screenshot && (
                      <div style={{ position: "relative" }}>
                        <img src={item.screenshot} alt="Screenshot" style={{ height: 40, border: "1px solid #ccc" }} />
                        <button
                          type="button"
                          onClick={() => {
                            updateItem(index, "screenshot", "");
                            updateItem(index, "screenshotOrientation", "");
                          }}
                          style={{
                            position: "absolute", top: -6, right: -6, background: "#ef4444", color: "white",
                            border: "none", borderRadius: "50%", width: 18, height: 18, fontSize: 10, cursor: "pointer",
                            display: "flex", justifyContent: "center", alignItems: "center", padding: 0
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="twoCol" style={{ marginTop: 18 }}>
              <div className="card innerCard">
                <label>Special Notes</label>
                <textarea
                  rows={6}
                  value={orderForm.specialNotes}
                  onChange={(e) => updateOrderField("specialNotes", e.target.value)}
                />
              </div>

              <div className="card innerCard">
                <label>Quick Customer Fill</label>
                <select onChange={(e) => quickFillCustomer(e.target.value)} value="">
                  <option value="">Choose customer</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <div style={{ marginTop: 16 }}>
                  <label>Lamination Type</label>
                  <select
                    value={orderForm.laminationType}
                    onChange={(e) => updateOrderField("laminationType", e.target.value)}
                  >
                    <option>None</option>
                    <option>Matt</option>
                    <option>Glossy</option>
                  </select>
                </div>

                <div style={{ marginTop: 16 }}>
                  <label>Finishing</label>
                  <div className="checkGrid">
                    <label className="checkItem">
                      <input
                        type="checkbox"
                        checked={orderForm.finishing.uv}
                        onChange={(e) => updateFinishingField("uv", e.target.checked)}
                      />
                      UV
                    </label>
                    <label className="checkItem">
                      <input
                        type="checkbox"
                        checked={orderForm.finishing.lamination}
                        onChange={(e) => updateFinishingField("lamination", e.target.checked)}
                      />
                      Lamination
                    </label>
                    <label className="checkItem">
                      <input
                        type="checkbox"
                        checked={orderForm.finishing.pasting}
                        onChange={(e) => updateFinishingField("pasting", e.target.checked)}
                      />
                      Pasting
                    </label>
                    <label className="checkItem">
                      <input
                        type="checkbox"
                        checked={orderForm.finishing.creasing}
                        onChange={(e) => updateFinishingField("creasing", e.target.checked)}
                      />
                      Creasing
                    </label>
                    <label className="checkItem">
                      <input
                        type="checkbox"
                        checked={orderForm.finishing.halfCutting}
                        onChange={(e) => updateFinishingField("halfCutting", e.target.checked)}
                      />
                      Half Cutting
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
              <button className="primaryBtn" onClick={addOrUpdateOrder}>
                {editingOrderId ? "Update Job Order" : "Save Job Order"}
              </button>
              <button className="secondaryBtn" onClick={resetOrderForm}>
                Clear
              </button>
            </div>
          </div>
        )}

        {view === "customers" && (
          <div className="twoColLeft">
            <div className="card">
              <h3 style={{ marginTop: 0 }}>Customer Database</h3>

              <div className="stackFields">
                <div>
                  <label>Name</label>
                  <input
                    value={customerForm.name}
                    onChange={(e) =>
                      setCustomerForm((p) => ({ ...p, name: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label>Phone</label>
                  <input
                    value={customerForm.phone}
                    onChange={(e) =>
                      setCustomerForm((p) => ({ ...p, phone: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label>Email</label>
                  <input
                    value={customerForm.email}
                    onChange={(e) =>
                      setCustomerForm((p) => ({ ...p, email: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label>Address</label>
                  <input
                    value={customerForm.address}
                    onChange={(e) =>
                      setCustomerForm((p) => ({ ...p, address: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label>Notes</label>
                  <textarea
                    rows={5}
                    value={customerForm.notes}
                    onChange={(e) =>
                      setCustomerForm((p) => ({ ...p, notes: e.target.value }))
                    }
                  />
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button className="primaryBtn" onClick={addOrUpdateCustomer}>
                    {editingCustomerId ? "Update" : "Save"}
                  </button>
                  <button className="secondaryBtn" onClick={resetCustomerForm}>
                    Clear
                  </button>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 style={{ marginTop: 0 }}>Saved Customers</h3>
              <div className="tableWrap">
                <table className="aaTable">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Phone</th>
                      <th>Orders</th>
                      <th>Total</th>
                      <th>Balance</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerRows.map((c) => (
                      <tr key={c.id}>
                        <td>
                          <div style={{ fontWeight: 700 }}>{c.name}</div>
                          <div className="mutedText">{c.address || "—"}</div>
                        </td>
                        <td>{c.phone || "—"}</td>
                        <td>{c.totalOrders}</td>
                        <td>{money(c.totalAmount)}</td>
                        <td>{money(c.balance)}</td>
                        <td>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button
                              className="secondaryBtn smallBtn"
                              onClick={() => editCustomer(c)}
                            >
                              Edit
                            </button>
                            <button
                              className="dangerBtn smallBtn"
                              onClick={() => deleteCustomer(c.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {view === "reports" && (
          <>
            <div className="card">
              <h3 style={{ marginTop: 0 }}>Monthly Report</h3>

              <div className="reportTop">
                <div>
                  <label>Month</label>
                  <input
                    type="month"
                    value={monthFilter}
                    onChange={(e) => setMonthFilter(e.target.value)}
                  />
                </div>

                <SummaryCard title="Orders" value={monthlyTotals.count} subtext="This month" />
                <SummaryCard title="Revenue" value={money(monthlyTotals.revenue)} subtext="Monthly total" />
                <SummaryCard title="Balance" value={money(monthlyTotals.balance)} subtext="Monthly due" />
              </div>
            </div>

            <div className="card">
              <h3 style={{ marginTop: 0 }}>Monthly Order List</h3>
              <div className="tableWrap">
                <table className="aaTable">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Job</th>
                      <th>Customer</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Advance</th>
                      <th>Balance</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyOrders.map((row) => (
                      <tr key={row.id}>
                        <td>{row.date}</td>
                        <td>{row.id}</td>
                        <td>{row.customer}</td>
                        <td>{row.items?.length || 0}</td>
                        <td>{money(row.totalAmount)}</td>
                        <td>{money(row.advance)}</td>
                        <td>{money(row.balance)}</td>
                        <td>
                          <StatusBadge status={row.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {view === "printables" && (
          <>
            <div className="card">
              <h3 style={{ marginTop: 0 }}>Print Settings</h3>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                <button
                  className={bilingualPrint ? "primaryBtn" : "secondaryBtn"}
                  onClick={() => setBilingualPrint(true)}
                >
                  Arabic + English
                </button>
                <button
                  className={!bilingualPrint ? "primaryBtn" : "secondaryBtn"}
                  onClick={() => setBilingualPrint(false)}
                >
                  English Only
                </button>
                <div className="mutedText">
                  Use Print and choose Save as PDF on Mac.
                </div>
              </div>
            </div>

            <div className="twoCol">
              {orders.slice(0, 6).map((order) => (
                <div className="card" key={order.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                    <h3 style={{ marginTop: 0, marginBottom: 10 }}>{order.id}</h3>
                    <StatusBadge status={order.status} />
                  </div>
                  <div style={{ fontWeight: 700 }}>{order.customer}</div>
                  <div className="mutedText" style={{ marginTop: 4 }}>
                    {order.items?.length || 0} items
                  </div>
                  <div className="mutedText" style={{ marginTop: 4 }}>
                    Delivery: {order.deliveryDate || "—"}
                  </div>
                  <div style={{ marginTop: 10, fontWeight: 700 }}>
                    {money(order.totalAmount)}{" "}
                    <span className="mutedText" style={{ fontWeight: 400 }}>
                      (Advance: {money(order.advance)})
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
                    <button
                      className="primaryBtn smallBtn"
                      onClick={() => printDocument(order)}
                    >
                      Print Job Order
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {view === "backup" && (
          <>
            <div className="twoCol">
              <div className="card">
                <h3 style={{ marginTop: 0 }}>Backup & Restore</h3>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button className="primaryBtn" onClick={exportBackup}>
                    Export Backup
                  </button>
                  <button
                    className="secondaryBtn"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Restore Backup
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/json"
                    style={{ display: "none" }}
                    onChange={importBackup}
                  />
                </div>
                <div className="mutedText" style={{ marginTop: 12 }}>
                  Backup includes company details, customer database and all orders.
                </div>
              </div>

              <div className="card">
                <h3 style={{ marginTop: 0 }}>Company Details</h3>

                <div className="stackFields">
                  <div>
                    <label>Company Name</label>
                    <input
                      value={company.name}
                      onChange={(e) =>
                        setCompany((p) => ({ ...p, name: e.target.value }))
                      }
                    />
                  </div>

                  <div>
                    <label>Tagline</label>
                    <input
                      value={company.tagline}
                      onChange={(e) =>
                        setCompany((p) => ({ ...p, tagline: e.target.value }))
                      }
                    />
                  </div>

                  <div>
                    <label>Address</label>
                    <input
                      value={company.address}
                      onChange={(e) =>
                        setCompany((p) => ({ ...p, address: e.target.value }))
                      }
                    />
                  </div>

                  <div>
                    <label>Phone</label>
                    <input
                      value={company.phone}
                      onChange={(e) =>
                        setCompany((p) => ({ ...p, phone: e.target.value }))
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="card" style={{ border: "1px solid #fecaca" }}>
              <h3 style={{ marginTop: 0, color: "#b91c1c" }}>Reset Demo Data</h3>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <div className="mutedText">
                  This resets the app to the default demo records.
                </div>
                <button className="dangerBtn" onClick={resetDemoData}>
                  Reset All
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function navBtn(active) {
  return active ? "navBtn navBtnActive" : "navBtn";
}