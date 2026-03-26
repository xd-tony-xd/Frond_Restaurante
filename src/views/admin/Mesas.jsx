import { useEffect, useState } from 'react';
import { supabase } from '../../api/supabase';
import { QRCodeSVG } from 'qrcode.react';
import { Plus, Trash2, Download, RefreshCw } from 'lucide-react';

export default function GestionMesas() {
  const [mesas, setMesas] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [nuevaMesa, setNuevaMesa] = useState({ numero_mesa: '', estado: 'libre' });

  useEffect(() => { fetchMesas(); }, []);

  async function fetchMesas() {
    const { data } = await supabase
      .from('mesas')
      .select('*')
      .eq('activo', true)
      .order('numero_mesa');

    setMesas(data || []);
  }

  const crearMesa = async (e) => {
    e.preventDefault();

    const token = `mesa-${nuevaMesa.numero_mesa}-${Math.random().toString(36).substr(2, 5)}`;

    const { error } = await supabase
      .from('mesas')
      .insert([{ ...nuevaMesa, token_qr: token, activo: true }]);

    if (!error) {
      setNuevaMesa({ numero_mesa: '', estado: 'libre' });
      setShowForm(false);
      fetchMesas();
    }
  };

  const deshabilitarMesa = async (id) => {
    if (confirm("¿Deshabilitar esta mesa?")) {
      await supabase
        .from('mesas')
        .update({ activo: false })
        .eq('id', id);

      fetchMesas();
    }
  };

  const resetQR = async (mesa) => {
    const nuevoToken = `mesa-${mesa.numero_mesa}-${Math.random().toString(36).substr(2,5)}`;

    await supabase
      .from('mesas')
      .update({ token_qr: nuevoToken })
      .eq('id', mesa.id);

    fetchMesas();
  };

  const descargarQR = (idMesa) => {
    const svg = document.getElementById(`qr-mesa-${idMesa}`);
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const pngFile = canvas.toDataURL("image/png");

      const downloadLink = document.createElement("a");
      downloadLink.download = `QR-Mesa-${idMesa}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">
            Mesas & <span className="text-orange-500">QR</span>
          </h1>
          <p className="text-gray-500 font-bold">
            Genera los accesos para tus clientes
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-gray-900 text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:bg-orange-500 transition-all flex items-center gap-2"
        >
          {showForm ? 'Cerrar' : <><Plus size={20}/> Agregar Mesa</>}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={crearMesa}
          className="bg-white p-6 rounded-3xl shadow-xl mb-10 border border-orange-100 max-w-md"
        >
          <div className="space-y-4">
            <div>
              <label className="text-xs font-black text-gray-400 uppercase ml-1">
                Número de Mesa
              </label>

              <input
                type="number"
                className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 font-black text-xl"
                value={nuevaMesa.numero_mesa}
                onChange={e => setNuevaMesa({...nuevaMesa, numero_mesa: e.target.value})}
                required
              />
            </div>

            <button className="w-full bg-orange-500 text-white py-4 rounded-2xl font-black shadow-lg">
              REGISTRAR MESA
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">

        {mesas.map(mesa => {

          const urlQR = mesa.token_qr
            ? `https://frond-restaurante.vercel.app/menu?mesa=${mesa.numero_mesa}&token=${mesa.token_qr}`
            : `https://frond-restaurante.vercel.app/menu?mesa=${mesa.numero_mesa}`;

          return (

            <div key={mesa.id} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col items-center group hover:shadow-xl transition-all">

              <div className="w-full flex justify-between items-start mb-4">
                <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase ${mesa.estado === 'libre' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                  {mesa.estado}
                </span>

                <button
                  onClick={() => deshabilitarMesa(mesa.id)}
                  className="text-gray-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={18}/>
                </button>
              </div>

              <div className="bg-gray-50 p-4 rounded-3xl mb-4 border-2 border-dashed border-gray-200">
                <QRCodeSVG
                  id={`qr-mesa-${mesa.numero_mesa}`}
                  value={urlQR}
                  size={150}
                  level={"H"}
                  includeMargin={true}
                />
              </div>

              <h2 className="text-2xl font-black text-gray-800 mb-1">
                MESA {mesa.numero_mesa}
              </h2>

              <div className="grid grid-cols-2 gap-2 w-full mt-4">

                <button
                  onClick={() => descargarQR(mesa.numero_mesa)}
                  className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-3 rounded-2xl font-bold hover:bg-gray-200 transition-all text-xs"
                >
                  <Download size={16}/> PNG
                </button>

                <button
                  onClick={() => resetQR(mesa)}
                  className="flex items-center justify-center gap-2 bg-orange-500 text-white py-3 rounded-2xl font-bold hover:shadow-lg transition-all text-xs"
                >
                  <RefreshCw size={16}/> Reset
                </button>

              </div>

            </div>

          );
        })}

      </div>
    </div>
  );
}