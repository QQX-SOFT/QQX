const fs = require('fs');
const file = 'c:\\Users\\Anwender\\Downloads\\QQX\\frontend\\src\\app\\driver\\orders\\page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add useRef to imports
content = content.replace(
    /import \{ useState, useEffect \} from "react";/,
    `import { useState, useEffect, useRef } from "react";`
);

// 2. Add full hooks list inside component header
const targetState = `const [orders, setOrders] = useState<Order[]>([]);`;
const appendState = `const [orders, setOrders] = useState<Order[]>([]);
    const [isSigning, setIsSigning] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);`;

if (!content.includes('const [isSigning')) {
    content = content.replace(targetState, appendState);
}

// 3. Add helper methods above fetchDashboardAndOrders
const helperMethods = `
    const handleStartOrder = async (orderId: string) => {
        try {
            await api.patch(\`/orders/\${orderId}/status\`, { status: 'ON_THE_WAY' });
            setSelectedOrder((prev: any) => prev ? { ...prev, status: 'ON_THE_WAY' } : null);
            setOrders((prev: any) => prev.map((o: any) => o.id === orderId ? { ...o, status: 'ON_THE_WAY' } : o));
            alert("Fahrt gestartet! Viel Erfolg.");
        } catch (e) {
            alert("Fehler beim Starten der Fahrt.");
        }
    };

    const handleFinishOrder = async (orderId: string, signature: string) => {
        try {
            if (!signature || signature.length < 50) {
                alert("Bitte unterschreiben Sie, um den Auftrag zu beenden.");
                return;
            }
            await api.patch(\`/orders/\${orderId}/status\`, { 
                status: 'DELIVERED',
                deliverySig: signature 
            });
            setSelectedOrder(null);
            setIsSigning(false);
            setOrders((prev: any) => prev.filter((o: any) => o.id !== orderId));
            alert("Auftrag erfolgreich beendet! Gute Arbeit.");
        } catch (e) {
            alert("Fehler beim Beenden des Auftrags.");
        }
    };

    const startDrawing = (e: any) => {
        setIsDrawing(true);
        draw(e);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx?.beginPath(); // reset path
        }
    };

    const draw = (e: any) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx || !canvas) return;

        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#000000';

        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
        const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;

        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    };
    
    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx?.clearRect(0, 0, canvas.width, canvas.height);
        }
    };

    const saveSignature = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const base64 = canvas.toDataURL('image/png');
            if (selectedOrder) {
                handleFinishOrder(selectedOrder.id, base64);
            }
        }
    };
`;

if (!content.includes('const handleStartOrder')) {
    content = content.replace('const fetchDashboardAndOrders = async () => {', helperMethods + '\n    const fetchDashboardAndOrders = async () => {');
}

// 4. Update detail footer buttons
const footerRegex = /\{!filter && \([\s\S]*?<button[\s\S]*?Auftrag Annehmen[\s\S]*?<\/button>[\s\S]*?\)\}/g;
const replacementFooter = `{!filter && (
                                <button 
                                    onClick={() => handleAcceptOrder(selectedOrder.id)}
                                    className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-blue-500/20 mb-3 transition-all duration-300"
                                >
                                    Auftrag Annehmen
                                </button>
                            )}

                            {filter === "accepted" && selectedOrder.status === "ACCEPTED" && (
                                <div className="space-y-3">
                                    <button 
                                        onClick={() => handleStartOrder(selectedOrder.id)}
                                        className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all duration-300"
                                    >
                                        🚀 Auftrag Starten
                                    </button>
                                </div>
                            )}

                            {selectedOrder.status === "ON_THE_WAY" && (
                                <button 
                                    onClick={() => setIsSigning(true)}
                                    className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all duration-300"
                                >
                                    ✅ Auftrag Beenden
                                </button>
                            )}`;

content = content.replace(footerRegex, replacementFooter);

// 5. Add Signature Modal inside AnimatePresence overlay loop at the bottom frame
const signatureModalHtml = `
            {/* Signature Pad Modal Overlay */}
            <AnimatePresence>
                {isSigning && selectedOrder && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSigning(false)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50" />
                        <motion.div initial={{ y: "100%" }} animate={{ y: "0" }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed bottom-0 inset-x-0 bg-white rounded-t-[3rem] p-6 z-50 shadow-2xl max-h-[85vh] overflow-y-auto">
                            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6" />
                            
                            <h2 className="text-xl font-black text-slate-900 text-center mb-2">Unterschrift des Kunden</h2>
                            <p className="text-xs text-slate-500 text-center mb-6">Bitte unterschreiben Sie auf dem Bildschirm zur Bestätigung der Zustellung.</p>

                            <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden mb-4 shadow-inner">
                                <canvas 
                                    ref={canvasRef}
                                    width={typeof window !== 'undefined' ? window.innerWidth - 48 : 340}
                                    height={200}
                                    onMouseDown={startDrawing}
                                    onMouseUp={stopDrawing}
                                    onMouseMove={draw}
                                    onMouseLeave={stopDrawing}
                                    onTouchStart={startDrawing}
                                    onTouchEnd={stopDrawing}
                                    onTouchMove={draw}
                                    className="bg-white mx-auto cursor-crosshair touch-none"
                                />
                            </div>

                            <div className="flex gap-2">
                                <button 
                                    onClick={clearCanvas}
                                    className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-xl font-black text-xs uppercase tracking-widest"
                                >
                                    Korrigieren
                                </button>
                                <button 
                                    onClick={saveSignature}
                                    className="flex-2 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-1.5"
                                >
                                    ✅ Zustellung abschließen
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
`;

// Insert signature overlay before the bottom closing tags or just before return closing tags
if (!content.includes('Unterschrift des Kunden')) {
    const returnRegex = /(<p className="text-center text-\[10px\] font-black text-slate-300)/g;
    content = content.replace(returnRegex, signatureModalHtml + '\n            $1');
}

fs.writeFileSync(file, content, 'utf8');
console.log("Full signature layout written!");
