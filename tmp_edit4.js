const fs = require('fs');
const file = 'c:\\Users\\Anwender\\Downloads\\QQX\\frontend\\src\\app\\driver\\orders\\page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Regex matches the status closing </p> tag spanning multiple lines
const regex = /(<p className="text-\[10px\] font-black text-slate-400 uppercase tracking-widest">Status<\/p>\s*<p className="text-sm font-bold text-slate-800">[^]*?<\/p>)/g;

const match = regex.exec(content);
if (match) {
    const matchedText = match[1];
    
    const button = `\n                                          {(selectedOrder.status === "ACCEPTED" || selectedOrder.status === "ON_THE_WAY") && (
                                              <button 
                                                  onClick={() => window.open(\`https://www.google.com/maps/search/?api=1&query=\${encodeURIComponent(selectedOrder.address)}\`, '_blank')}
                                                  className="mt-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5 transition-all duration-300 w-fit"
                                              >
                                                  <Navigation size={13} className="fill-white" /> Route Starten
                                              </button>
                                          )}`;
                                          
    content = content.replace(matchedText, matchedText + button);
    fs.writeFileSync(file, content, 'utf8');
    console.log("Success with resilient regex match!");
} else {
    console.log("Regex FAILED to match status section");
}
