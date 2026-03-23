const fs = require('fs');
const path = require('path');
const file = 'c:\\Users\\Anwender\\Downloads\\QQX\\frontend\\src\\app\\driver\\orders\\page.tsx';

let content = fs.readFileSync(file, 'utf8');

// 1. Translate Status inline
const targetStatus = `<p className="text-sm font-bold text-slate-800">{selectedOrder.status}</p>`;
const replacementStatus = `<p className="text-sm font-bold text-slate-800">
                                            {selectedOrder.status === "PENDING" ? "Wartend" : 
                                             selectedOrder.status === "ACCEPTED" ? "Angenommen" : 
                                             selectedOrder.status === "ON_THE_WAY" ? "Auf dem Weg" : 
                                             selectedOrder.status === "DELIVERED" ? "Zugestellt" : selectedOrder.status}
                                         </p>`;

if (content.includes(targetStatus)) {
    content = content.replace(targetStatus, replacementStatus);
} else {
    // try removing spaces differences just in case
    content = content.replace(/<p className="text-sm font-bold text-slate-800">\{selectedOrder\.status\}<\/p>/g, replacementStatus);
}

// 2. Add Route starten Button
const targetButton = `{!filter && (`;
const replacementButton = `{filter === "accepted" && (
                                <button 
                                    onClick={() => window.open(\`https://www.google.com/maps/search/?api=1&query=\${encodeURIComponent(selectedOrder.address)}\`, '_blank')}
                                    className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-3 mb-3 transition-all duration-300"
                                >
                                    <Navigation size={18} className="fill-white" /> Route Starten
                                </button>
                            )}
                            {!filter && (`;

content = content.replace(targetButton, replacementButton);

fs.writeFileSync(file, content, 'utf8');
console.log("Replaced order.status and added button!");
