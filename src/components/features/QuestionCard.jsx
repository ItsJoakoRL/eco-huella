// import React from 'react';

export default function QuestionCard({ 
  question, 
  moduleLabel, 
  currentStep, 
  totalSteps, 
  selectedValue, 
  onSelect, 
  onNext, 
  onPrev,
  onClose
}) {
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className="eco-aurora relative min-h-[100dvh] flex flex-col bg-surface overflow-hidden">
      {/* Decorative Organic Elements (Ocultos en móvil para mejorar rendimiento y lectura) */}
      <div className="hidden md:block fixed -bottom-24 -right-24 w-96 h-96 bg-primary-container/20 rounded-full blur-[100px] pointer-events-none z-0"></div>
      <div className="hidden md:block fixed top-24 -left-24 w-64 h-64 bg-secondary-container/10 rounded-full blur-[80px] pointer-events-none z-0"></div>

      {/* Header & Progress */}
      <header className="animate-rise relative w-full max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 flex flex-col gap-4 md:gap-6 z-10">
        <div className="flex justify-between items-center">
          <span className="text-primary font-headline text-xl md:text-2xl font-black tracking-tighter animate-pulse-soft">EcoHuella</span>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center hover:bg-surface-container-high transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant">close</span>
          </button>
        </div>
        <div className="space-y-2 md:space-y-3">
          <div className="flex justify-between items-end">
            <span className="font-label text-[10px] md:text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Progreso</span>
            <span className="font-headline text-base md:text-lg font-bold text-primary">Paso {currentStep} de {totalSteps}</span>
          </div>
          <div className="w-full h-4 md:h-6 bg-surface-container-high rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative flex-grow w-full max-w-5xl mx-auto px-4 md:px-6 flex flex-col justify-center pt-4 pb-32 md:pb-40 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start lg:items-center">
          
          {/* Question Section */}
          <section className="animate-rise lg:col-span-5 space-y-4 md:space-y-6">
            <div className="inline-block px-3 py-1 bg-primary-container text-on-primary-container rounded-full text-[10px] md:text-xs font-bold font-label uppercase tracking-widest">
              {moduleLabel}
            </div>
            {/* Escalado tipográfico: text-3xl en móvil, 4xl en tablet, 5xl en desktop */}
            <h1 className="font-headline text-3xl md:text-4xl lg:text-5xl leading-[1.1] font-extrabold text-on-surface tracking-tight">
              {question.text}
            </h1>
            {question.description && (
              <p className="text-on-surface-variant text-base md:text-lg leading-relaxed max-w-md">
                {question.description}
              </p>
            )}
          </section>

          {/* Options Grid / Inputs */}
          <section className="animate-pop lg:col-span-7 w-full" style={{ animationDelay: '120ms' }}>
            
            {/* RENDERIZADO PARA TIPO SELECT (Botones) */}
            {question.type === 'select' && (
              // En móvil es 1 columna, en sm (tablet) son 2
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                {question.options?.map((option, index) => {
                  const isSelected = selectedValue === option.label;
                  
                  return (
                    <button 
                      key={index}
                      onClick={() => onSelect(option.label)}
                      // Quitamos aspect-square en móvil, lo dejamos para pantallas medianas
                      className={`hover-lift group relative w-full min-h-[100px] sm:aspect-square p-5 md:p-8 rounded-[24px] editorial-shadow flex flex-col justify-center sm:justify-between items-start text-left transition-all duration-300 scale-100 active:scale-95
                        ${isSelected 
                          ? 'bg-primary-container ring-4 ring-primary ring-inset' 
                          : 'bg-surface-container-lowest hover:bg-primary-container/50'}`}
                    >
                      <div className={`w-12 h-12 md:w-14 md:h-14 mb-3 sm:mb-0 rounded-2xl flex items-center justify-center transition-colors shrink-0
                        ${isSelected ? 'bg-surface-container-lowest' : 'bg-surface-container-low group-hover:bg-surface-container-lowest'}`}>
                        <span className="material-symbols-outlined text-primary text-2xl md:text-3xl">
                          {option.icon || 'eco'}
                        </span>
                      </div>
                      <div className="w-full pr-8 sm:pr-0">
                        <span className={`block font-headline text-xl md:text-2xl font-bold leading-tight ${isSelected ? 'text-on-primary-container' : 'text-on-surface'}`}>
                          {option.label}
                        </span>
                        {option.unit && (
                          <span className="block font-label text-xs md:text-sm text-on-surface-variant mt-1">
                            {option.unit}
                          </span>
                        )}
                      </div>
                      
                      {isSelected && (
                        <div className="absolute top-5 right-5 sm:top-6 sm:right-6">
                          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* RENDERIZADO PARA TIPO NUMBER (Input de texto) */}
            {question.type === 'number' && (
              <div className="mt-4 w-full">
                <input 
                  type="number" 
                  min="1"
                  placeholder={question.placeholder}
                  value={selectedValue || ''}
                  onChange={(e) => onSelect(e.target.value)}
                  className="hover-lift w-full bg-surface-container-lowest border-none rounded-[24px] p-6 md:p-8 text-3xl md:text-4xl font-headline text-primary focus:ring-4 focus:ring-primary focus:outline-none editorial-shadow transition-all"
                />
              </div>
            )}

            {/* RENDERIZADO PARA TIPO RANGE (Slider) */}
            {question.type === 'range' && (
              <div className="hover-lift mt-4 w-full bg-surface-container-lowest p-6 md:p-8 rounded-[24px] editorial-shadow">
                <div className="flex justify-between font-headline text-xl md:text-2xl font-bold text-primary mb-6 md:mb-8">
                  <span>{question.min}</span>
                  <span className="text-3xl md:text-4xl">{selectedValue || question.min}</span>
                  <span>{question.max}+</span>
                </div>
                <input 
                  type="range" 
                  min={question.min} 
                  max={question.max} 
                  step={question.step || 1}
                  value={selectedValue || question.min}
                  onChange={(e) => onSelect(e.target.value)}
                  className="w-full h-4 bg-surface-container-high rounded-full appearance-none cursor-pointer"
                />
              </div>
            )}

          </section>
        </div>
      </main>

      {/* Bottom Navigation */}
      <footer className="fixed bottom-0 left-0 w-full bg-surface/90 backdrop-blur-xl py-4 md:py-6 px-4 md:px-6 z-20 border-t border-surface-container-low">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button 
            onClick={onPrev}
            disabled={currentStep === 1}
            className={`flex items-center gap-1 md:gap-2 px-4 md:px-8 py-3 md:py-4 rounded-full font-headline font-bold transition-colors scale-100 active:scale-95 text-sm md:text-base
              ${currentStep === 1 ? 'opacity-0 pointer-events-none' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
          >
            <span className="material-symbols-outlined text-xl md:text-24px">arrow_back</span>
            <span className="hidden sm:inline">Atrás</span>
          </button>
          
          <button 
            onClick={onNext}
            disabled={!selectedValue}
            className={`eco-glow-button flex items-center gap-2 md:gap-3 px-6 md:px-10 py-3 md:py-4 rounded-full font-headline font-extrabold text-base md:text-lg editorial-shadow transition-all duration-200 scale-100 active:scale-95
              ${selectedValue 
                ? 'bg-gradient-to-b from-tertiary-container to-tertiary text-on-tertiary-fixed inner-button-highlight' 
                : 'bg-surface-container-high text-on-surface-variant opacity-50 cursor-not-allowed'}`}
          >
            Siguiente
            <span className="material-symbols-outlined text-xl md:text-24px">arrow_forward</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
