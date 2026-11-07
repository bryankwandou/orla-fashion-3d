import React, { useEffect, useState } from 'react';
import { AtelierStage3D, EditorialStage } from './components/AtelierStage3D';

interface LookPiece {
  id: number;
  code: string;
  name: string;
  batch: string;
  composition: string;
  dye: string;
  price: string;
  notes: string;
}

const ARCHIVE_LOOKS: LookPiece[] = [
  {
    id: 0,
    code: 'LOOK 01',
    name: 'Asymmetric Cutout Hemp Knit & Patchwork Denim',
    batch: 'Batch #OR-204 / 18 Pieces Cut',
    composition: '62% Rain-Fed Organic Hemp, 38% Post-Consumer Salvage Cotton',
    dye: 'Cold-bath Madder Root & Washed Indigofera',
    price: '€460',
    notes: 'Hand-loomed in our Porto studio from surplus mill ends; zero virgin dye water.',
  },
  {
    id: 1,
    code: 'LOOK 02',
    name: 'Distressed Wide-Leg Deadstock Atelier Trouser',
    batch: 'Batch #OR-209 / 12 Pieces Cut',
    composition: '98% Post-Consumer Vintage Selvedge Denim, 2% Hemp Twine',
    dye: 'Overdyed Mineral Slate & Botanical Indigo',
    price: '€390',
    notes: 'Reconstructed from fourarchived workwear panels with hand-darned knee slashes.',
  },
  {
    id: 2,
    code: 'LOOK 03',
    name: 'Raw Botanical Moss Sculpted Drape Top',
    batch: 'Batch #OR-215 / 15 Pieces Cut',
    composition: '100% Unbleached Deadstock Linen & Hemp Rib',
    dye: 'Wild Weld, Walnut Hull & Fermented Indigo',
    price: '€340',
    notes: 'Bias-cut in a single continuous pattern piece to eliminate off-cut waste.',
  },
];

const MATERIAL_SPECS = [
  { material: 'Organic hemp', detail: 'Rain-fed, no pesticides' },
  { material: 'Recycled denim', detail: '98% post-consumer waste' },
  { material: 'Botanical dye', detail: 'Indigofera & madder root' },
];

export const App: React.FC = () => {
  const [stage, setStage] = useState<EditorialStage>(0);
  const [selectedLook, setSelectedLook] = useState<number>(0);
  const [fabricTension, setFabricTension] = useState<number>(1.0);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [reserveModalOpen, setReserveModalOpen] = useState<boolean>(false);
  const [reservedSuccess, setReservedSuccess] = useState<boolean>(false);

  // Smooth wheel stage transitions matching the editorial video flow
  useEffect(() => {
    let lastWheel = 0;
    const onWheel = (e: WheelEvent) => {
      if (menuOpen || reserveModalOpen) return;
      const now = performance.now();
      if (now - lastWheel < 850) return;
      if (Math.abs(e.deltaY) < 28) return;

      lastWheel = now;
      if (e.deltaY > 0) {
        setStage((prev) => (prev < 2 ? ((prev + 1) as EditorialStage) : 0));
      } else {
        setStage((prev) => (prev > 0 ? ((prev - 1) as EditorialStage) : 2));
      }
    };
    window.addEventListener('wheel', onWheel, { passive: true });
    return () => window.removeEventListener('wheel', onWheel);
  }, [menuOpen, reserveModalOpen]);

  const currentLook = ARCHIVE_LOOKS[selectedLook];

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#FAF9F6] text-[#202822] select-none">
      {/* Real-Time Three.js 3D Sculptural Garment & Editorial Figure Stage */}
      <div className="absolute inset-0 z-10">
        <AtelierStage3D
          stage={stage}
          selectedLook={selectedLook}
          fabricTension={fabricTension}
        />
      </div>

      {/* TOP BAR: Signature Orla. Logo + Minimal 2-Line Menu Button */}
      <header className="relative z-30 flex items-start justify-between px-8 sm:px-12 pt-7">
        <button
          type="button"
          onClick={() => setStage(0)}
          aria-label="Orla Atelier Home"
          className="text-left cursor-pointer group flex items-baseline"
        >
          <span
            className="italic font-normal text-[54px] sm:text-[66px] leading-none tracking-[-0.04em] text-[#202822]"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            O
          </span>
          <span className="font-light text-[46px] sm:text-[56px] leading-none tracking-[-0.045em] text-[#202822]">
            rla.
          </span>
        </button>

        <div className="flex items-center gap-6 pt-3">
          {/* Stage Quick Switcher Pills */}
          <nav aria-label="Editorial Chapters" className="hidden md:flex items-center gap-2">
            {[
              { id: 0 as EditorialStage, label: '01 Reach' },
              { id: 1 as EditorialStage, label: '02 Provenance' },
              { id: 2 as EditorialStage, label: '03 Archive' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setStage(item.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs transition cursor-pointer ${
                  stage === item.id
                    ? 'bg-[#202822] text-white font-medium'
                    : 'text-[#686B65] hover:text-[#202822]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Minimal 2-Line '=' Menu Button */}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open Atelier Manifesto and Stockists"
            className="w-10 h-10 flex flex-col items-end justify-center gap-1.5 cursor-pointer hover:opacity-65 transition"
          >
            <span className="w-6 h-[1.5px] bg-[#202822]" />
            <span className="w-6 h-[1.5px] bg-[#202822]" />
          </button>
        </div>
      </header>

      {/* =================================================================== */}
      {/* STAGE 1 OVERLAY (c_intro_24.jpg): Conceptual Reach & Explore CTA    */}
      {/* =================================================================== */}
      <div
        className={`absolute inset-0 z-20 pointer-events-none transition-all duration-700 ${
          stage === 0 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        }`}
      >
        <div className="absolute left-8 sm:left-12 top-[54%] -translate-y-1/2 max-w-[255px]">
          <p className="text-[13.5px] leading-[1.48] text-[#5C5F5A] font-normal">
            Conceptual pieces made slowly from fibres that already exist. Dyed by hand, cut once,
            worn for years.
          </p>
        </div>

        <div className="absolute left-8 sm:left-12 bottom-10 pointer-events-auto flex items-center gap-4">
          <button
            type="button"
            onClick={() => setStage(1)}
            className="bg-[#202822] text-white px-6 py-3 rounded-full text-xs font-medium tracking-wide hover:bg-[#323D35] transition cursor-pointer shadow-md"
          >
            Explore Provenance
          </button>
          <button
            type="button"
            onClick={() => setStage(2)}
            className="border border-[#202822]/25 bg-white/70 backdrop-blur-md text-[#202822] px-5 py-3 rounded-full text-xs font-medium hover:bg-white transition cursor-pointer"
          >
            Inspect 3D Weave
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* STAGE 2 OVERLAY (c_intro_26.jpg): Deadstock Headline & Spec Table   */}
      {/* =================================================================== */}
      <div
        className={`absolute inset-0 z-20 pointer-events-none transition-all duration-700 ${
          stage === 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        {/* Left Editorial Statement */}
        <div className="absolute left-8 sm:left-12 top-[43%] -translate-y-1/2 max-w-[390px]">
          <h1 className="text-[28px] sm:text-[35px] leading-[1.2] font-light tracking-[-0.025em] text-[#7A7C78]">
            <span className="block">Every piece starts with what</span>
            <span className="block">already exists: deadstock,</span>
          </h1>
          <button
            type="button"
            onClick={() => setStage(2)}
            className="pointer-events-auto mt-6 inline-flex items-center gap-2 text-xs font-medium text-[#202822] border-b border-[#202822] pb-1 hover:opacity-70 cursor-pointer"
          >
            <span>View Batch Serial Archive</span>
            <span>→</span>
          </button>
        </div>

        {/* Right-Lower Technical Material Specification Table */}
        <div className="absolute right-8 sm:right-12 bottom-16 w-[310px] sm:w-[340px] pointer-events-auto bg-[#FAF9F6]/85 backdrop-blur-md p-2 rounded-xl">
          <div className="divide-y divide-[#202822]/12 border-t border-b border-[#202822]/12">
            {MATERIAL_SPECS.map((row) => (
              <div
                key={row.material}
                className="py-3.5 flex items-center justify-between text-[12px]"
              >
                <span className="font-medium text-[#3A3E3B]">{row.material}</span>
                <span className="text-[#8A8D88] font-normal">{row.detail}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* STAGE 3 OVERLAY: Interactive 3D Weave & Garment Archive Inspector   */}
      {/* =================================================================== */}
      <div
        className={`absolute inset-0 z-20 pointer-events-none transition-all duration-700 ${
          stage === 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        <div className="absolute right-8 sm:right-12 top-1/2 -translate-y-1/2 w-[340px] sm:w-[390px] bg-white/88 backdrop-blur-xl p-6 rounded-3xl border border-[#202822]/12 shadow-xl pointer-events-auto">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold tracking-widest uppercase text-[#6E736E]">
              {currentLook.batch}
            </span>
            <span className="text-sm font-semibold text-[#202822]">{currentLook.price}</span>
          </div>

          <h2 className="text-xl font-medium text-[#202822] mt-1.5 leading-snug">
            {currentLook.name}
          </h2>
          <p className="text-xs text-[#5E625E] mt-2 leading-relaxed">{currentLook.notes}</p>

          {/* Look Selector Pills */}
          <div className="grid grid-cols-3 gap-2 mt-5">
            {ARCHIVE_LOOKS.map((lk) => (
              <button
                key={lk.id}
                type="button"
                onClick={() => setSelectedLook(lk.id)}
                className={`py-2 px-3 rounded-xl text-xs font-medium border transition cursor-pointer ${
                  selectedLook === lk.id
                    ? 'bg-[#202822] text-white border-[#202822]'
                    : 'border-[#202822]/15 text-[#202822] hover:bg-[#202822]/5'
                }`}
              >
                {lk.code}
              </button>
            ))}
          </div>

          {/* Interactive 3D Textile Drape Tension Slider */}
          <div className="mt-5 pt-4 border-t border-[#202822]/10">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-[#5E625E]">3D Loom Drape Ripple</span>
              <span className="font-medium">{Math.round(fabricTension * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="1.8"
              step="0.1"
              value={fabricTension}
              onChange={(e) => setFabricTension(parseFloat(e.target.value))}
              className="w-full accent-[#202822] cursor-pointer"
            />
          </div>

          <div className="mt-4 space-y-1.5 text-xs text-[#484C48]">
            <div>
              <strong className="font-medium text-[#202822]">Fibre: </strong>
              {currentLook.composition}
            </div>
            <div>
              <strong className="font-medium text-[#202822]">Botanical Vat: </strong>
              {currentLook.dye}
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setReservedSuccess(false);
              setReserveModalOpen(true);
            }}
            className="mt-6 w-full py-3 rounded-full bg-[#202822] text-white text-xs font-medium tracking-wide hover:bg-[#333F36] transition cursor-pointer"
          >
            Reserve Numbered Piece
          </button>
        </div>
      </div>

      {/* BOTTOM-CENTER SCROLL / STAGE PROGRESS CAPSULE (matching c_intro_26.jpg) */}
      <footer className="absolute inset-x-0 bottom-5 z-30 flex items-center justify-center">
        <div className="flex items-center gap-3 bg-white/70 backdrop-blur-md px-4 py-2 rounded-full border border-[#202822]/10 shadow-sm">
          {[0, 1, 2].map((idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setStage(idx as EditorialStage)}
              aria-label={`Go to Editorial Stage ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                stage === idx ? 'w-12 bg-[#202822]' : 'w-4 bg-[#202822]/20 hover:bg-[#202822]/40'
              }`}
            />
          ))}
        </div>
      </footer>

      {/* Atelier Manifesto Drawer */}
      {menuOpen && (
        <div className="absolute inset-0 z-40 bg-black/30 backdrop-blur-sm flex justify-end">
          <div className="bg-[#FAF9F6] text-[#202822] w-full max-w-md h-full p-8 flex flex-col justify-between shadow-2xl border-l border-[#202822]/10">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-[#202822]/12">
                <span className="text-xs font-semibold tracking-widest uppercase text-[#686B65]">
                  Orla. Deadstock Ledger
                </span>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="text-xs px-3 py-1.5 rounded-full border border-[#202822]/20 hover:bg-[#202822] hover:text-white transition cursor-pointer"
                >
                  Close
                </button>
              </div>

              <h2
                className="text-3xl italic font-normal mt-6 leading-snug"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Zero virgin fibres. Every bolt traced to its origin mill.
              </h2>
              <p className="text-sm text-[#5A5D58] leading-relaxed mt-4">
                We collect end-of-roll organic hemp, salvaged workwear denim, and unbleached raw
                linen from family-run European mills. Each garment is dyed in small rainwater vats
                using madder root, weld, and Indigofera tinctoria.
              </p>

              <div className="mt-8 space-y-3">
                {ARCHIVE_LOOKS.map((lk) => (
                  <button
                    key={lk.id}
                    type="button"
                    onClick={() => {
                      setSelectedLook(lk.id);
                      setStage(2);
                      setMenuOpen(false);
                    }}
                    className="w-full text-left p-4 rounded-2xl border border-[#202822]/12 hover:border-[#202822] transition flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <div className="text-[11px] font-semibold text-[#6E736E]">{lk.batch}</div>
                      <div className="text-sm font-medium mt-0.5">{lk.name}</div>
                    </div>
                    <span className="text-sm font-semibold">{lk.price}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs text-[#7A7C78] border-t border-[#202822]/12 pt-4 flex items-center justify-between">
              <span>Porto & Copenhagen Atelier</span>
              <span>B-Corp Certified Traceability</span>
            </div>
          </div>
        </div>
      )}

      {/* Numbered Piece Reservation Modal */}
      {reserveModalOpen && (
        <div className="absolute inset-0 z-40 bg-black/35 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FAF9F6] text-[#202822] rounded-3xl p-7 max-w-md w-full border border-[#202822]/15 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-[#6E736E] font-semibold">
                {currentLook.batch}
              </span>
              <button
                type="button"
                onClick={() => setReserveModalOpen(false)}
                className="text-xs px-2.5 py-1 rounded-full border border-[#202822]/20 cursor-pointer"
              >
                Close
              </button>
            </div>

            <h3 className="text-xl font-medium mt-2">{currentLook.name}</h3>
            <p className="text-xs text-[#5E625E] mt-1">{currentLook.composition}</p>

            {reservedSuccess ? (
              <div className="mt-6 p-4 rounded-2xl bg-[#202822] text-white text-xs leading-relaxed">
                Piece #07 of {currentLook.batch} has been reserved for your atelier fitting.
                Provenance certificate generated.
              </div>
            ) : (
              <div className="mt-5">
                <div className="text-xs font-medium mb-2">Select Atelier Fit</div>
                <div className="grid grid-cols-4 gap-2">
                  {['Size 1', 'Size 2', 'Size 3', 'Bespoke'].map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setReservedSuccess(true)}
                      className="py-2.5 rounded-xl border border-[#202822]/20 hover:bg-[#202822] hover:text-white text-xs font-medium transition cursor-pointer"
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
