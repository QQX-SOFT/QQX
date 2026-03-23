const fs = require('fs');
const file = 'c:\\Users\\Anwender\\Downloads\\QQX\\frontend\\src\\app\\driver\\orders\\page.tsx';

let content = fs.readFileSync(file, 'utf8');

// 1. Remove buggy button placed before Sorting Tabs
const buggyButton = `{filter === "accepted" && (
                                <button 
                                    onClick={() => window.open(\`https://www.google.com/maps/search/?api=1&query=\${encodeURIComponent(selectedOrder.address)}\`, '_blank')}
                                    className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-3 mb-3 transition-all duration-300"
                                >
                                    <Navigation size={18} className="fill-white" /> Route Starten
                                </button>
                            )}
                            `;

if (content.indexOf(buggyButton) !== -1) {
    content = content.replace(buggyButton, '');
    console.log("Buggy button removed!");
}

// 2. Add Button directly under Angenommen status
const statusStr = `<p className="text-sm font-bold text-slate-800">
                                             {selectedOrder.status === "PENDING" ? "Wartend" : 
                                              selectedOrder.status === "ACCEPTED" ? "Angenommen" : 
                                              selectedOrder.status === "ON_THE_WAY" ? "Auf dem Weg" : 
                                              selectedOrder.status === "DELIVERED" ? "Zugestellt" : selectedOrder.status}
                                          </p>`;

const appendButton = `<p className="text-sm font-bold text-slate-800">
                                             {selectedOrder.status === "PENDING" ? "Wartend" : 
                                              selectedOrder.status === "ACCEPTED" ? "Angenommen" : 
                                              selectedOrder.status === "ON_THE_WAY" ? "Auf dem Weg" : 
                                              selectedOrder.status === "DELIVERED" ? "Zugestellt" : selectedOrder.status}
                                          </p>
                                          {(selectedOrder.status === "ACCEPTED" || selectedOrder.status === "ON_THE_WAY") && (
                                              <button 
                                                  onClick={() => window.open(\`https://www.google.com/maps/search/?api=1&query=\${encodeURIComponent(selectedOrder.address)}\`, '_blank')}
                                                  className="mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5 transition-all duration-300"
                                              >
                                                  <Navigation size={14} className="fill-white" /> Route Starten
                                              </button>
                                          )}`;

if (content.indexOf(statusStr) !== -1) {
    content = content.replace(statusStr, appendButton);
    console.log("Status button appended!");
} else {
    // If exact spaces differ inside the file, try a more resilient lookup
    const lines = content.split('\n');
    let found = false;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('selectedOrder.status === "PENDING" ? "Wartend"') && lines[i+4].includes('selectedOrder.status')) {
            lines[i+4] = lines[i+4] + `\n                                          {(selectedOrder.status === "ACCEPTED" || selectedOrder.status === "ON_THE_WAY") && (
                                              <button 
                                                  onClick={() => window.open(\`https://www.google.com/maps/search/?api=1&query=\${encodeURIComponent(selectedOrder.address)}\`, '_blank')}
                                                  className="mt-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5 transition-all duration-300 w-fit"
                                              >
                                                  <Navigation size={13} className="fill-white" /> Route Starten
                                              </button>
                                          )}`;
            found = true;
            break;
        }
    }
    if (found) {
        content = lines.join('\n');
        console.log("Status button appended via resilient matching!");
    } else {
        console.log("Status text NOT found in either checks!");
    }
}

fs.writeFileSync(file, content, 'utf8');
