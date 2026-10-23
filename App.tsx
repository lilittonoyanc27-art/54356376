import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Sparkles,
  Feather,
  Languages,
  Flame,
  MessageSquare,
  HelpCircle,
  Radio,
  Box,
  UserCheck,
  Palette,
  Zap,
  Compass,
  Tag,
  FileText,
  Link as LinkIcon,
  GitBranch,
  AlertCircle,
  Volume2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Eye,
  EyeOff,
  Search,
  BookMarked,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  Type,
} from 'lucide-react';

import {
  literaturaData,
  gramaticaData,
  ejerciciosData,
  resumenCategorias,
  TrilingualItem,
  SectionContent,
  ExerciseData,
} from './data';

// Map icon string to component
const iconMap: Record<string, React.ElementType> = {
  Sparkles,
  BookOpen,
  Feather,
  Languages,
  Flame,
  MessageSquare,
  HelpCircle,
  Radio,
  Box,
  UserCheck,
  Palette,
  Zap,
  Compass,
  Tag,
  FileText,
  Link: LinkIcon,
  GitBranch,
  AlertCircle,
};

export default function App() {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'all' | 'literatura' | 'gramatica' | 'ejercicios' | 'resumen'>('all');
  const [selectedSectionId, setSelectedSectionId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Font size state: 'md' (standard), 'lg' (large - default), 'xl' (extra large)
  const [fontSize, setFontSize] = useState<'md' | 'lg' | 'xl'>('lg');

  // Translation visibility states per item id: key -> { hy: boolean, ru: boolean }
  // By default completely FALSE so neither opens until user clicks on choice
  const [translationsVisibility, setTranslationsVisibility] = useState<Record<string, { hy: boolean; ru: boolean }>>({});
  
  // Section headers / situations translation visibility: key -> { hy: boolean, ru: boolean }
  const [sectionTransVisibility, setSectionTransVisibility] = useState<Record<string, { hy: boolean; ru: boolean }>>({});

  // Question translation visibility: key -> { hy: boolean, ru: boolean }
  const [questionTransVisibility, setQuestionTransVisibility] = useState<Record<string, { hy: boolean; ru: boolean }>>({});

  // Global translation preference override ('custom' | 'all' | 'none' | 'hy' | 'ru')
  const [globalMode, setGlobalMode] = useState<'custom' | 'all' | 'none' | 'hy' | 'ru'>('custom');

  // Exercise state: exerciseId -> { questionId -> selectedOption }
  const [exerciseAnswers, setExerciseAnswers] = useState<Record<string, Record<string, string>>>({});
  // Exercise show answers state: exerciseId -> boolean
  const [exerciseShowAnswers, setExerciseShowAnswers] = useState<Record<string, boolean>>({});

  // Font size configuration classes
  const f = {
    md: {
      spanish: 'text-lg sm:text-xl font-semibold',
      spanishHeader: 'text-xl sm:text-2xl font-bold',
      transText: 'text-base sm:text-lg',
      meta: 'text-xs sm:text-sm',
      btn: 'text-xs sm:text-sm px-3 py-1.5',
      badge: 'text-xs px-2.5 py-1',
      option: 'text-sm py-2.5 px-3',
    },
    lg: {
      spanish: 'text-xl sm:text-2xl font-semibold',
      spanishHeader: 'text-2xl sm:text-3xl font-extrabold',
      transText: 'text-lg sm:text-xl',
      meta: 'text-sm sm:text-base',
      btn: 'text-sm sm:text-base px-4 py-2',
      badge: 'text-sm px-3 py-1',
      option: 'text-base py-3 px-4',
    },
    xl: {
      spanish: 'text-2xl sm:text-3xl font-bold',
      spanishHeader: 'text-3xl sm:text-4xl font-black',
      transText: 'text-xl sm:text-2xl',
      meta: 'text-base sm:text-lg',
      btn: 'text-base sm:text-lg px-5 py-2.5',
      badge: 'text-base px-3.5 py-1.5',
      option: 'text-lg py-3.5 px-5',
    },
  }[fontSize];

  // Pronunciation handler
  const speakSpanish = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Toggle individual item translation: ONLY the clicked language flips
  const toggleTranslation = (id: string, lang: 'hy' | 'ru') => {
    // If in a forced global mode, switch back to custom
    if (globalMode !== 'custom') {
      setGlobalMode('custom');
    }
    setTranslationsVisibility((prev) => {
      const current = prev[id] || { hy: false, ru: false };
      return {
        ...prev,
        [id]: {
          ...current,
          [lang]: !current[lang],
        },
      };
    });
  };

  // Toggle section header translation
  const toggleSectionTranslation = (id: string, lang: 'hy' | 'ru') => {
    setSectionTransVisibility((prev) => {
      const current = prev[id] || { hy: false, ru: false };
      return {
        ...prev,
        [id]: {
          ...current,
          [lang]: !current[lang],
        },
      };
    });
  };

  // Toggle question translation
  const toggleQuestionTranslation = (id: string, lang: 'hy' | 'ru') => {
    setQuestionTransVisibility((prev) => {
      const current = prev[id] || { hy: false, ru: false };
      return {
        ...prev,
        [id]: {
          ...current,
          [lang]: !current[lang],
        },
      };
    });
  };

  // Check if translation is visible given item id and language
  const isItemVisible = (id: string, lang: 'hy' | 'ru') => {
    if (globalMode === 'all') return true;
    if (globalMode === 'none') return false;
    if (globalMode === 'hy') return lang === 'hy';
    if (globalMode === 'ru') return lang === 'ru';
    return translationsVisibility[id]?.[lang] || false;
  };

  const isSectionVisible = (id: string, lang: 'hy' | 'ru') => {
    if (globalMode === 'all') return true;
    if (globalMode === 'none') return false;
    if (globalMode === 'hy') return lang === 'hy';
    if (globalMode === 'ru') return lang === 'ru';
    return sectionTransVisibility[id]?.[lang] || false;
  };

  const isQuestionVisible = (id: string, lang: 'hy' | 'ru') => {
    if (globalMode === 'all') return true;
    if (globalMode === 'none') return false;
    if (globalMode === 'hy') return lang === 'hy';
    if (globalMode === 'ru') return lang === 'ru';
    return questionTransVisibility[id]?.[lang] || false;
  };

  // Set answer for an exercise question
  const handleSelectAnswer = (exerciseId: string, questionId: string, answer: string) => {
    setExerciseAnswers((prev) => ({
      ...prev,
      [exerciseId]: {
        ...(prev[exerciseId] || {}),
        [questionId]: answer,
      },
    }));
  };

  // Toggle reveal all answers for an exercise
  const toggleShowExerciseAnswers = (exerciseId: string) => {
    setExerciseShowAnswers((prev) => ({
      ...prev,
      [exerciseId]: !prev[exerciseId],
    }));
  };

  // Reset exercise
  const resetExercise = (exerciseId: string) => {
    setExerciseAnswers((prev) => ({
      ...prev,
      [exerciseId]: {},
    }));
    setExerciseShowAnswers((prev) => ({
      ...prev,
      [exerciseId]: false,
    }));
  };

  // Combine sections for view
  const allSections: SectionContent[] = useMemo(() => {
    return [...literaturaData, ...gramaticaData];
  }, []);

  const displayedSections = useMemo(() => {
    let sections = allSections;
    if (activeTab === 'literatura') {
      sections = literaturaData;
    } else if (activeTab === 'gramatica') {
      sections = gramaticaData;
    } else if (activeTab === 'ejercicios' || activeTab === 'resumen') {
      return [];
    }

    if (selectedSectionId !== 'all') {
      sections = sections.filter((s) => s.id === selectedSectionId);
    }

    if (!searchQuery.trim()) return sections;

    const query = searchQuery.toLowerCase();
    return sections
      .map((sec) => {
        const matchesTitle =
          sec.titleEs.toLowerCase().includes(query) ||
          sec.titleHy.toLowerCase().includes(query) ||
          sec.titleRu.toLowerCase().includes(query);

        const filteredItems = sec.items.filter(
          (item) =>
            item.es.toLowerCase().includes(query) ||
            item.hy.toLowerCase().includes(query) ||
            item.ru.toLowerCase().includes(query) ||
            (item.category && item.category.toLowerCase().includes(query))
        );

        if (matchesTitle || filteredItems.length > 0) {
          return {
            ...sec,
            items: matchesTitle ? sec.items : filteredItems,
          };
        }
        return null;
      })
      .filter((s): s is SectionContent => s !== null);
  }, [allSections, activeTab, selectedSectionId, searchQuery]);

  // Render a trilingual item card with separate choice buttons under each Spanish sentence
  const renderItemCard = (item: TrilingualItem) => {
    const showHy = isItemVisible(item.id, 'hy');
    const showRu = isItemVisible(item.id, 'ru');

    const isHeader = item.type === 'heading';
    const isExample = item.type === 'example';
    const isVocab = item.type === 'vocabulary';

    return (
      <div
        key={item.id}
        className={`group relative rounded-2xl border transition-all duration-200 ${
          isHeader
            ? 'bg-amber-50/80 border-amber-300 p-5 shadow-sm'
            : isExample
            ? 'bg-emerald-50/70 border-emerald-300 p-5 shadow-sm'
            : isVocab
            ? 'bg-indigo-50/70 border-indigo-300 p-5 shadow-sm'
            : 'bg-white border-slate-300 p-5 shadow-sm hover:border-slate-400'
        }`}
      >
        {/* Top category label & audio pronunciation */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            {item.category && (
              <span className={`font-bold uppercase tracking-wider text-slate-700 bg-slate-200/90 rounded-md ${f.badge}`}>
                {item.category}
              </span>
            )}
            <button
              onClick={() => speakSpanish(item.es)}
              title="Escuchar pronunciación (Español)"
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-amber-700 hover:text-amber-950 bg-amber-100 hover:bg-amber-200 transition-colors font-medium text-xs sm:text-sm"
            >
              <Volume2 className="w-4 h-4" />
              <span>Озвучить</span>
            </button>
          </div>
        </div>

        {/* 🇪🇸 Spanish sentence (large prominent text) */}
        <div className="mb-4">
          <div className="flex items-start gap-2.5">
            <span className="text-xl sm:text-2xl select-none mt-0.5">🇪🇸</span>
            <p
              className={`text-slate-950 leading-relaxed ${
                isHeader ? f.spanishHeader : f.spanish
              }`}
            >
              {item.es}
            </p>
          </div>
        </div>

        {/* 🔘 CHOICE BUTTONS UNDER THE SPANISH SENTENCE (на выбор: Арм или Рус) */}
        <div className="pt-3 pb-1 border-t border-slate-200/80 flex flex-wrap items-center gap-2.5">
          <span className={`text-slate-500 font-semibold ${f.meta}`}>
            Перевод на выбор:
          </span>

          {/* Armenian choice button */}
          <button
            onClick={() => toggleTranslation(item.id, 'hy')}
            className={`flex items-center gap-2 rounded-xl font-bold transition-all shadow-xs ${f.btn} ${
              showHy
                ? 'bg-red-600 text-white ring-2 ring-red-400 ring-offset-1'
                : 'bg-white text-slate-800 hover:bg-red-50 hover:text-red-700 border-2 border-red-200 hover:border-red-400'
            }`}
            title="Нажмите, чтобы показать / скрыть армянский перевод этого предложения"
          >
            <span className="text-base sm:text-lg">🇦🇲</span>
            <span>{showHy ? 'Скрыть Հայերեն' : 'Հայերեն (Арм)'}</span>
            {showHy ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {/* Russian choice button */}
          <button
            onClick={() => toggleTranslation(item.id, 'ru')}
            className={`flex items-center gap-2 rounded-xl font-bold transition-all shadow-xs ${f.btn} ${
              showRu
                ? 'bg-blue-600 text-white ring-2 ring-blue-400 ring-offset-1'
                : 'bg-white text-slate-800 hover:bg-blue-50 hover:text-blue-700 border-2 border-blue-200 hover:border-blue-400'
            }`}
            title="Нажмите, чтобы показать / скрыть русский перевод этого предложения"
          >
            <span className="text-base sm:text-lg">🇷🇺</span>
            <span>{showRu ? 'Скрыть Русский' : 'Русский (Рус)'}</span>
            {showRu ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* 🇦🇲 Armenian translation box (revealed ONLY if chosen) */}
        {showHy && (
          <div className="mt-3.5 p-3.5 sm:p-4 rounded-xl bg-red-50/90 border-2 border-red-200 text-slate-900 transition-all">
            <div className="flex items-start gap-2.5">
              <span className="text-base font-extrabold text-red-700 uppercase tracking-wide shrink-0 flex items-center gap-1.5 mt-0.5">
                <span>🇦🇲</span> Հայերեն:
              </span>
              <p className={`text-slate-950 font-medium leading-relaxed ${f.transText}`}>{item.hy}</p>
            </div>
          </div>
        )}

        {/* 🇷🇺 Russian translation box (revealed ONLY if chosen) */}
        {showRu && (
          <div className="mt-3 p-3.5 sm:p-4 rounded-xl bg-blue-50/90 border-2 border-blue-200 text-slate-900 transition-all">
            <div className="flex items-start gap-2.5">
              <span className="text-base font-extrabold text-blue-700 uppercase tracking-wide shrink-0 flex items-center gap-1.5 mt-0.5">
                <span>🇷🇺</span> Русский:
              </span>
              <p className={`text-slate-950 font-medium leading-relaxed ${f.transText}`}>{item.ru}</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render an interactive exercise with large fonts and translation choice buttons
  const renderExercise = (exercise: ExerciseData) => {
    const userAnswers = exerciseAnswers[exercise.id] || {};
    const showAnswers = exerciseShowAnswers[exercise.id] || false;

    // Calculate score
    let score = 0;
    exercise.questions.forEach((q) => {
      if (userAnswers[q.id] === q.correctAnswer) {
        score++;
      }
    });

    const isCompleted = Object.keys(userAnswers).length === exercise.questions.length;

    const showInstHy = isSectionVisible(`${exercise.id}-inst`, 'hy');
    const showInstRu = isSectionVisible(`${exercise.id}-inst`, 'ru');

    const showSitHy = isSectionVisible(`${exercise.id}-sit`, 'hy');
    const showSitRu = isSectionVisible(`${exercise.id}-sit`, 'ru');

    return (
      <div
        key={exercise.id}
        id={exercise.id}
        className="bg-white rounded-2xl border-2 border-slate-300 shadow-sm p-6 sm:p-8 mb-10 hover:shadow-md transition-shadow"
      >
        {/* Header */}
        <div className="border-b border-slate-200 pb-5 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-950">{exercise.titleEs}</h3>
              <p className="text-sm sm:text-base text-red-700 font-semibold mt-1">🇦🇲 {exercise.titleHy}</p>
              <p className="text-sm sm:text-base text-blue-700 font-semibold">🇷🇺 {exercise.titleRu}</p>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`px-4 py-2 rounded-xl text-sm sm:text-base font-bold shadow-xs ${
                  score === exercise.questions.length && isCompleted
                    ? 'bg-emerald-100 text-emerald-950 border-2 border-emerald-400'
                    : 'bg-amber-100 text-amber-950 border-2 border-amber-300'
                }`}
              >
                Результат: {score} / {exercise.questions.length}
              </span>
              <button
                onClick={() => resetExercise(exercise.id)}
                className="p-2.5 rounded-xl text-slate-600 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-300"
                title="Сбросить ответы"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Instructions box with translation choice */}
          <div className="mt-4 bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-200">
            <p className={`font-bold text-slate-950 ${f.transText}`}>🇪🇸 {exercise.instructionsEs}</p>
            
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-200/60">
              <span className="text-xs sm:text-sm font-semibold text-slate-500">Инструкция:</span>
              <button
                onClick={() => toggleSectionTranslation(`${exercise.id}-inst`, 'hy')}
                className={`text-xs sm:text-sm font-bold px-2.5 py-1 rounded-lg border transition-all ${
                  showInstHy ? 'bg-red-600 text-white border-red-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-red-50'
                }`}
              >
                🇦🇲 ՀԱՅ
              </button>
              <button
                onClick={() => toggleSectionTranslation(`${exercise.id}-inst`, 'ru')}
                className={`text-xs sm:text-sm font-bold px-2.5 py-1 rounded-lg border transition-all ${
                  showInstRu ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-blue-50'
                }`}
              >
                🇷🇺 РУС
              </button>
            </div>

            {showInstHy && <p className="text-sm sm:text-base text-red-800 font-semibold mt-2">🇦🇲 {exercise.instructionsHy}</p>}
            {showInstRu && <p className="text-sm sm:text-base text-blue-800 font-semibold mt-1">🇷🇺 {exercise.instructionsRu}</p>}
          </div>

          {/* Situation box if present */}
          {exercise.situationEs && (
            <div className="mt-4 p-4 sm:p-5 bg-amber-50/90 border-2 border-amber-300 rounded-xl">
              <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-900 block mb-1">
                Situación / Իրավիճակ / Ситуация
              </span>
              <p className={`font-bold text-slate-950 ${f.spanish}`}>🇪🇸 {exercise.situationEs}</p>

              <div className="flex items-center gap-2 mt-2.5 pt-2 border-t border-amber-200">
                <span className="text-xs sm:text-sm font-semibold text-slate-600">Перевод ситуации:</span>
                <button
                  onClick={() => toggleSectionTranslation(`${exercise.id}-sit`, 'hy')}
                  className={`text-xs sm:text-sm font-bold px-2.5 py-1 rounded-lg border transition-all ${
                    showSitHy ? 'bg-red-600 text-white border-red-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-red-50'
                  }`}
                >
                  🇦🇲 ՀԱՅ
                </button>
                <button
                  onClick={() => toggleSectionTranslation(`${exercise.id}-sit`, 'ru')}
                  className={`text-xs sm:text-sm font-bold px-2.5 py-1 rounded-lg border transition-all ${
                    showSitRu ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-blue-50'
                  }`}
                >
                  🇷🇺 РУС
                </button>
              </div>

              {showSitHy && <p className="text-base text-red-900 font-medium mt-2">🇦🇲 {exercise.situationHy}</p>}
              {showSitRu && <p className="text-base text-blue-900 font-medium mt-1">🇷🇺 {exercise.situationRu}</p>}
            </div>
          )}
        </div>

        {/* Questions list */}
        <div className="space-y-6">
          {exercise.questions.map((q) => {
            const currentAnswer = userAnswers[q.id];
            const isCorrect = currentAnswer === q.correctAnswer;
            const hasAnswered = currentAnswer !== undefined;

            const qShowHy = isQuestionVisible(q.id, 'hy');
            const qShowRu = isQuestionVisible(q.id, 'ru');

            return (
              <div
                key={q.id}
                className={`p-5 sm:p-6 rounded-2xl border-2 transition-all ${
                  hasAnswered
                    ? isCorrect
                      ? 'bg-emerald-50/60 border-emerald-300'
                      : 'bg-rose-50/60 border-rose-300'
                    : 'bg-slate-50 border-slate-300'
                }`}
              >
                {/* Spanish question and pronunciation */}
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className={`text-slate-950 font-bold ${f.spanish}`}>
                        🇪🇸 {q.questionEs}
                      </span>
                      <button
                        onClick={() => speakSpanish(q.questionEs)}
                        className="text-amber-700 hover:text-amber-950 p-1 bg-amber-100 rounded-lg hover:bg-amber-200 transition-colors"
                        title="Озвучить на испанском"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Question choice buttons for ARM / RUS */}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs sm:text-sm font-semibold text-slate-500">Вопрос на выбор:</span>
                      <button
                        onClick={() => toggleQuestionTranslation(q.id, 'hy')}
                        className={`text-xs sm:text-sm font-bold px-2.5 py-1 rounded-lg border transition-all ${
                          qShowHy
                            ? 'bg-red-600 text-white border-red-600'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-red-50'
                        }`}
                      >
                        🇦🇲 {qShowHy ? 'Скрыть ՀԱՅ' : 'ՀԱՅ'}
                      </button>
                      <button
                        onClick={() => toggleQuestionTranslation(q.id, 'ru')}
                        className={`text-xs sm:text-sm font-bold px-2.5 py-1 rounded-lg border transition-all ${
                          qShowRu
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-blue-50'
                        }`}
                      >
                        🇷🇺 {qShowRu ? 'Скрыть РУС' : 'РУС'}
                      </button>
                    </div>

                    {qShowHy && <p className="text-base sm:text-lg text-red-800 font-semibold mt-2">🇦🇲 {q.questionHy}</p>}
                    {qShowRu && <p className="text-base sm:text-lg text-blue-800 font-semibold mt-1">🇷🇺 {q.questionRu}</p>}
                  </div>

                  {hasAnswered && (
                    <span
                      className={`flex items-center gap-1.5 text-sm sm:text-base font-bold px-3 py-1 rounded-lg ${
                        isCorrect ? 'bg-emerald-200 text-emerald-950' : 'bg-rose-200 text-rose-950'
                      }`}
                    >
                      {isCorrect ? (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-emerald-700" /> Правильно
                        </>
                      ) : (
                        <>
                          <XCircle className="w-5 h-5 text-rose-700" /> Неверно
                        </>
                      )}
                    </span>
                  )}
                </div>

                {/* Target word display if any */}
                {q.targetWord && (
                  <div className="my-3 flex items-center gap-2">
                    <span className="text-sm sm:text-base font-bold text-slate-600">Слово для определения: </span>
                    <span className="text-base sm:text-lg font-black text-indigo-900 bg-indigo-100 px-3 py-1 rounded-lg border border-indigo-300">
                      «{q.targetWord}»
                    </span>
                  </div>
                )}

                {/* Options selector (prominent buttons with large text) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-4">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = currentAnswer === opt;
                    const isTheCorrectOne = showAnswers && opt === q.correctAnswer;

                    return (
                      <button
                        key={`${q.id}-opt-${optIdx}`}
                        onClick={() => handleSelectAnswer(exercise.id, q.id, opt)}
                        className={`text-left rounded-xl font-bold border-2 transition-all flex items-center justify-between ${f.option} ${
                          isSelected
                            ? isCorrect
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-300'
                              : 'bg-rose-600 text-white border-rose-600 shadow-md ring-2 ring-rose-300'
                            : isTheCorrectOne
                            ? 'bg-emerald-100 text-emerald-950 border-emerald-500 font-extrabold ring-2 ring-emerald-400'
                            : 'bg-white text-slate-800 border-slate-300 hover:border-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        <span>{opt}</span>
                        {isSelected && (
                          isCorrect ? <CheckCircle2 className="w-5 h-5 shrink-0 ml-2" /> : <XCircle className="w-5 h-5 shrink-0 ml-2" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Reveal Explanation if showAnswers is active or user answered */}
                {(showAnswers || (hasAnswered && !isCorrect)) && (
                  <div className="mt-4 pt-3.5 border-t-2 border-slate-300/70 text-slate-800">
                    <p className="font-bold text-emerald-900 text-base sm:text-lg">
                      ✓ Правильный ответ: <span className="underline">{q.correctAnswer}</span>
                    </p>
                    {q.explanationEs && <p className="text-slate-900 font-medium text-base mt-1">🇪🇸 {q.explanationEs}</p>}
                    {q.explanationHy && <p className="text-red-900 font-medium text-base mt-0.5">🇦🇲 {q.explanationHy}</p>}
                    {q.explanationRu && <p className="text-blue-900 font-medium text-base mt-0.5">🇷🇺 {q.explanationRu}</p>}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer actions */}
        <div className="mt-8 pt-5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={() => toggleShowExerciseAnswers(exercise.id)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm sm:text-base font-bold bg-slate-100 text-slate-800 hover:bg-slate-200 transition-colors border border-slate-300"
          >
            {showAnswers ? (
              <>
                <EyeOff className="w-4 h-4" /> Скрыть ответы / Скрыть подсказки
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" /> Mostrar respuestas · Ցույց տալ պատասխանները · Показать ответы
              </>
            )}
          </button>

          <div className="text-sm sm:text-base font-bold text-slate-600">
            {isCompleted ? (
              <span className="text-emerald-700 font-extrabold">✓ Все вопросы выполнены!</span>
            ) : (
              <span>
                Отвечено {Object.keys(userAnswers).length} из {exercise.questions.length}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950 font-sans antialiased">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between py-3 gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-red-500 flex items-center justify-center text-white shadow-sm font-black text-xl">
                ES
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-black text-slate-950 leading-tight">
                  Lengua Castellana y Literatura
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 font-semibold">
                  🇪🇸 Español • 🇦🇲 Հայերեն • 🇷🇺 Русский • 1.º de ESO
                </p>
              </div>
            </div>

            {/* Font size controller and global modes */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Font Size Selector */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-300">
                <span className="text-xs font-bold text-slate-500 px-2 flex items-center gap-1">
                  <Type className="w-3.5 h-3.5" /> Шрифт:
                </span>
                <button
                  onClick={() => setFontSize('md')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    fontSize === 'md' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Обычный шрифт"
                >
                  A
                </button>
                <button
                  onClick={() => setFontSize('lg')}
                  className={`px-2.5 py-1 rounded-lg text-sm font-extrabold transition-all ${
                    fontSize === 'lg' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Крупный шрифт (рекомендуется)"
                >
                  A+
                </button>
                <button
                  onClick={() => setFontSize('xl')}
                  className={`px-2.5 py-1 rounded-lg text-base font-black transition-all ${
                    fontSize === 'xl' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Очень крупный шрифт"
                >
                  A++
                </button>
              </div>

              {/* Global translation modes */}
              <div className="hidden xl:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-300">
                <button
                  onClick={() => setGlobalMode('custom')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    globalMode === 'custom'
                      ? 'bg-white text-slate-950 shadow-xs'
                      : 'text-slate-600 hover:text-slate-950'
                  }`}
                  title="Только по нажатию кнопок под каждым предложением"
                >
                  Выбор под каждым
                </button>
                <button
                  onClick={() => setGlobalMode('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    globalMode === 'all'
                      ? 'bg-slate-950 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-950'
                  }`}
                >
                  Все (🇦🇲+🇷🇺)
                </button>
                <button
                  onClick={() => setGlobalMode('hy')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    globalMode === 'hy'
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-950'
                  }`}
                >
                  Только 🇦🇲 ՀԱՅ
                </button>
                <button
                  onClick={() => setGlobalMode('ru')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    globalMode === 'ru'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-950'
                  }`}
                >
                  Только 🇷🇺 РУС
                </button>
                <button
                  onClick={() => setGlobalMode('none')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    globalMode === 'none'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-950'
                  }`}
                >
                  Только 🇪🇸 ES
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Bar */}
          <div className="flex items-center gap-2 overflow-x-auto py-2.5 scrollbar-none border-t border-slate-200">
            <button
              onClick={() => {
                setActiveTab('all');
                setSelectedSectionId('all');
              }}
              className={`px-4 py-2 rounded-xl text-sm sm:text-base font-bold whitespace-nowrap transition-all ${
                activeTab === 'all'
                  ? 'bg-slate-950 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200/80'
              }`}
            >
              📚 Полный курс
            </button>
            <button
              onClick={() => {
                setActiveTab('literatura');
                setSelectedSectionId('all');
              }}
              className={`px-4 py-2 rounded-xl text-sm sm:text-base font-bold whitespace-nowrap transition-all ${
                activeTab === 'literatura'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200/80'
              }`}
            >
              🎭 Литература и риторика
            </button>
            <button
              onClick={() => {
                setActiveTab('gramatica');
                setSelectedSectionId('all');
              }}
              className={`px-4 py-2 rounded-xl text-sm sm:text-base font-bold whitespace-nowrap transition-all ${
                activeTab === 'gramatica'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200/80'
              }`}
            >
              📐 Грамматика (1.º ESO)
            </button>
            <button
              onClick={() => setActiveTab('ejercicios')}
              className={`px-4 py-2 rounded-xl text-sm sm:text-base font-bold whitespace-nowrap transition-all ${
                activeTab === 'ejercicios'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200/80'
              }`}
            >
              ✏️ Все упражнения (1—14)
            </button>
            <button
              onClick={() => setActiveTab('resumen')}
              className={`px-4 py-2 rounded-xl text-sm sm:text-base font-bold whitespace-nowrap transition-all ${
                activeTab === 'resumen'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200/80'
              }`}
            >
              📊 Таблица 10 частей речи
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Controls row: Search + Section quick jump + mobile translation buttons */}
        <div className="bg-white rounded-2xl border-2 border-slate-300 p-4 mb-6 shadow-xs">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            {/* Search */}
            <div className="relative w-full md:w-96">
              <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Поиск слова, правила или термина..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl text-sm sm:text-base bg-slate-50 border-2 border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3 text-sm font-bold text-slate-400 hover:text-slate-700"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Quick jump dropdown if in text view */}
            {activeTab !== 'ejercicios' && activeTab !== 'resumen' && (
              <div className="w-full md:w-auto flex items-center gap-2">
                <span className="text-sm text-slate-600 font-bold whitespace-nowrap">Тема:</span>
                <select
                  value={selectedSectionId}
                  onChange={(e) => setSelectedSectionId(e.target.value)}
                  className="w-full md:w-80 py-2.5 px-3.5 rounded-xl text-sm font-bold bg-slate-50 border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                >
                  <option value="all">⚡ Все темы курса ({allSections.length})</option>
                  <optgroup label="🎭 Литература">
                    {literaturaData.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.titleEs}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="📐 Грамматика 1.º ESO">
                    {gramaticaData.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.titleEs}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Tab 1: Text sections (All / Literatura / Gramática) */}
        {(activeTab === 'all' || activeTab === 'literatura' || activeTab === 'gramatica') && (
          <div className="space-y-12">
            {displayedSections.length === 0 && (
              <div className="text-center py-16 bg-white rounded-2xl border-2 border-slate-300">
                <Search className="w-14 h-14 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-700 font-bold text-lg">Ничего не найдено по запросу «{searchQuery}»</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-4 px-5 py-2 rounded-xl bg-slate-200 text-sm font-bold text-slate-800 hover:bg-slate-300"
                >
                  Сбросить поиск
                </button>
              </div>
            )}

            {displayedSections.map((section) => {
              const IconComponent = iconMap[section.iconName] || BookOpen;

              // Find associated exercise if any
              const matchedExercise = ejerciciosData.find(
                (ej) =>
                  (section.id === 'tema-1-funciones' && ej.id === 'ejercicio-1') ||
                  (section.id === 'tema-2-modalidades' && ej.id === 'ejercicio-2') ||
                  (section.id === 'tema-3-comunicacion' && ej.id === 'ejercicio-3') ||
                  (section.id === 'tema-4-sustantivo' && ej.id === 'ejercicio-4') ||
                  (section.id === 'tema-5-pronombre' && ej.id === 'ejercicio-5') ||
                  (section.id === 'tema-6-adjetivo' && ej.id === 'ejercicio-6') ||
                  (section.id === 'tema-7-verbo' && ej.id === 'ejercicio-7') ||
                  (section.id === 'tema-8-adverbio' && ej.id === 'ejercicio-8') ||
                  (section.id === 'tema-9-determinante' && ej.id === 'ejercicio-9') ||
                  (section.id === 'tema-10-articulo' && ej.id === 'ejercicio-10') ||
                  (section.id === 'tema-11-preposicion' && ej.id === 'ejercicio-11') ||
                  (section.id === 'tema-12-conjuncion' && ej.id === 'ejercicio-12') ||
                  (section.id === 'tema-13-interjeccion' && ej.id === 'ejercicio-13')
              );

              return (
                <section
                  key={section.id}
                  id={section.id}
                  className="bg-white rounded-3xl border-2 border-slate-300 shadow-sm p-6 sm:p-8"
                >
                  {/* Section Title */}
                  <div className="flex items-start justify-between gap-4 border-b-2 border-slate-100 pb-5 mb-8">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center shrink-0 shadow-xs">
                        <IconComponent className="w-7 h-7" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h2 className="text-2xl sm:text-3xl font-black text-slate-950">{section.titleEs}</h2>
                          {section.badge && (
                            <span className="text-xs sm:text-sm font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-300">
                              {section.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-sm sm:text-base text-red-700 font-semibold mt-1">🇦🇲 {section.titleHy}</p>
                        <p className="text-sm sm:text-base text-blue-700 font-semibold">🇷🇺 {section.titleRu}</p>
                      </div>
                    </div>
                  </div>

                  {/* Sentences and definitions list with individual choice buttons */}
                  <div className="space-y-5">
                    {section.items.map((item) => renderItemCard(item))}
                  </div>

                  {/* Inline interactive exercise if matching */}
                  {matchedExercise && (
                    <div className="mt-12 pt-8 border-t-4 border-dashed border-slate-200">
                      <div className="flex items-center gap-2 mb-6 text-indigo-800">
                        <GraduationCap className="w-7 h-7" />
                        <span className="font-black text-lg sm:text-xl uppercase tracking-wider">
                          Интерактивное упражнение к этой теме
                        </span>
                      </div>
                      {renderExercise(matchedExercise)}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}

        {/* Tab 2: Ejercicios (All 14 exercises) */}
        {activeTab === 'ejercicios' && (
          <div className="space-y-10">
            <div className="bg-indigo-50 border-2 border-indigo-300 rounded-3xl p-6 sm:p-8 mb-8 shadow-xs">
              <h2 className="text-2xl sm:text-3xl font-black text-indigo-950 flex items-center gap-3">
                <GraduationCap className="w-8 h-8 text-indigo-700" />
                Все 14 интерактивных упражнений с проверкой ответов
              </h2>
              <p className="text-base sm:text-lg text-indigo-900 mt-2 font-medium">
                Каждое упражнение полностью интерактивно: выбирайте варианты, получайте мгновенную оценку,
                используйте кнопку «Mostrar respuestas · Ցույց տալ պատասխանները · Показать ответы» для самопроверки!
              </p>
            </div>

            {ejerciciosData.map((exercise) => renderExercise(exercise))}
          </div>
        )}

        {/* Tab 3: Resumen tabular de las 10 categorías gramaticales */}
        {activeTab === 'resumen' && (
          <div className="bg-white rounded-3xl border-2 border-slate-300 p-6 sm:p-8 shadow-sm">
            <div className="border-b border-slate-200 pb-5 mb-6">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-950 flex items-center gap-3">
                <BookMarked className="w-8 h-8 text-purple-700" />
                Resumen — Ամփոփում — Повторение
              </h2>
              <p className="text-base sm:text-lg text-slate-700 mt-1 font-medium">
                Сводная таблица всех 10 грамматических категорий испанского языка с названиями на трёх языках и
                определениями.
              </p>
            </div>

            <div className="overflow-x-auto rounded-2xl border-2 border-slate-300">
              <table className="w-full text-left text-base">
                <thead className="bg-slate-100 text-slate-900 font-extrabold border-b-2 border-slate-300 text-sm sm:text-base uppercase tracking-wider">
                  <tr>
                    <th className="py-4 px-4 sm:px-6">#</th>
                    <th className="py-4 px-4 sm:px-6">🇪🇸 Español</th>
                    <th className="py-4 px-4 sm:px-6">🇦🇲 Հայերեն</th>
                    <th className="py-4 px-4 sm:px-6">🇷🇺 Русский</th>
                    <th className="py-4 px-4 sm:px-6">Краткое описание / Función</th>
                    <th className="py-4 px-4 sm:px-6 text-center">Действие</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {resumenCategorias.map((cat, idx) => (
                    <tr key={cat.es} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-4 sm:px-6 font-bold text-slate-400">{idx + 1}</td>
                      <td className="py-4 px-4 sm:px-6 font-black text-slate-950 flex items-center gap-2">
                        <span>{cat.es}</span>
                        <button
                          onClick={() => speakSpanish(cat.es)}
                          className="text-amber-700 hover:text-amber-950 p-1 bg-amber-50 rounded-lg hover:bg-amber-200"
                          title="Озвучить"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </td>
                      <td className="py-4 px-4 sm:px-6 font-bold text-red-700">{cat.hy}</td>
                      <td className="py-4 px-4 sm:px-6 font-bold text-blue-700">{cat.ru}</td>
                      <td className="py-4 px-4 sm:px-6 text-slate-700 text-sm sm:text-base">
                        <div className="font-semibold text-slate-950">🇪🇸 {cat.descEs}</div>
                        <div className="text-red-800 mt-1">🇦🇲 {cat.descHy}</div>
                        <div className="text-blue-800 mt-0.5">🇷🇺 {cat.descRu}</div>
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-center">
                        <button
                          onClick={() => {
                            setActiveTab('gramatica');
                            setSelectedSectionId(`tema-${idx + 4}-${cat.es.toLowerCase()}`);
                          }}
                          className="px-3 py-1.5 text-xs sm:text-sm font-bold bg-indigo-100 text-indigo-900 hover:bg-indigo-200 rounded-xl transition-colors whitespace-nowrap border border-indigo-300"
                        >
                          К теме →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Final test quick link */}
            <div className="mt-8 p-6 sm:p-8 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-2xl border-2 border-indigo-300 flex flex-col sm:flex-row items-center justify-between gap-5">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-950">Готовы проверить знания?</h3>
                <p className="text-sm sm:text-base text-slate-700 font-medium mt-1">
                  Пройдите итоговое упражнение 14 на распознавание всех 10 частей речи с подсчётом баллов!
                </p>
              </div>
              <button
                onClick={() => setActiveTab('ejercicios')}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-md transition-colors shrink-0"
              >
                Открыть упражнения →
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t-2 border-slate-300 bg-white py-10 text-center text-sm text-slate-600 font-medium">
        <p className="font-extrabold text-slate-900 text-base">Lengua Castellana y Literatura — 1.º de ESO</p>
        <p className="mt-1 text-slate-500">
          Интерактивное учебное пособие с параллельным переводом на армянский и русский языки
        </p>
      </footer>
    </div>
  );
}
