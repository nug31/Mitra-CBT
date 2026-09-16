import React, { useState, useEffect, useRef } from 'react';
import { 
  Exam, 
  Question, 
  ExamParticipant, 
  Answer, 
  ExamResult 
} from '../types';
import { db, getRealtimeChannel, realtimeBus } from '../services/db';
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Bookmark, 
  CheckCircle2, 
  AlertTriangle, 
  Wifi, 
  WifiOff, 
  ShieldAlert, 
  ShieldCheck, 
  ShieldX, 
  Lock, 
  AlertOctagon, 
  Ban, 
  Send, 
  ZoomIn, 
  Layers, 
  HelpCircle, 
  Sparkles, 
  Trophy, 
  XCircle, 
  Split, 
  Mic, 
  Smartphone, 
  EyeOff,
  Maximize2,
  Volume2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ImageModal } from '../components/common/ImageModal';

interface StudentExamRoomProps {
  exam: Exam;
  participant: ExamParticipant;
  onExitExam: () => void;
}

export const StudentExamRoom: React.FC<StudentExamRoomProps> = ({
  exam,
  participant,
  onExitExam
}) => {
  // Questions list (honoring randomize_questions if set)
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Answers state keyed by question_id
  const [answersMap, setAnswersMap] = useState<Record<string, {
    selected_option_ids: string[];
    text_answer: string;
    is_marked_review: boolean;
  }>>({});

  // Auto-save connection badge state: 'saved' | 'saving' | 'offline'
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'offline'>('saved');

  // Server-synced countdown timer
  const [remainingSeconds, setRemainingSeconds] = useState<number>(
    participant.remaining_seconds && participant.remaining_seconds > 0
      ? participant.remaining_seconds
      : exam.duration_minutes * 60
  );

  // Anti-Cheat Settings
  const MAX_STRIKES = 3;
  const [violationCount, setViolationCount] = useState<number>(participant.cheat_warning_count || 0);
  const [tabSwitchWarningOpen, setTabSwitchWarningOpen] = useState(false);
  const [multiScreenWarningOpen, setMultiScreenWarningOpen] = useState(false);
  const [voiceAiWarningOpen, setVoiceAiWarningOpen] = useState(false);
  const [detectedVoiceText, setDetectedVoiceText] = useState('');
  const [isScreenShielded, setIsScreenShielded] = useState(false);
  const [isForceSubmitted, setIsForceSubmitted] = useState(participant.status === 'force_submitted');
  const [hasEnteredFullscreen, setHasEnteredFullscreen] = useState(false);
  const [isFullscreenActive, setIsFullscreenActive] = useState(false);
  const [isMicActive, setIsMicActive] = useState(false);
  const [lastViolationReason, setLastViolationReason] = useState('');

  // Modals & warnings
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [examResult, setExamResult] = useState<ExamResult | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [fullscreenWarningOpen, setFullscreenWarningOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Question navigation drawer on mobile/tablet
  const [paletteOpen, setPaletteOpen] = useState(false);

  // Tracking refs to avoid stale closures in event listeners
  const hasStartedRef = useRef(false);
  const examResultRef = useRef<ExamResult | null>(null);
  const isSubmittingRef = useRef(false);
  const wasBlurredRef = useRef(false);
  const speechRecognitionRef = useRef<any>(null);
  const audioContextRef = useRef<any>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const screenCheckTimerRef = useRef<any>(null);
  const lastViolationTimeRef = useRef<number>(0);

  // Synchronize live refs
  useEffect(() => {
    examResultRef.current = examResult;
  }, [examResult]);

  useEffect(() => {
    isSubmittingRef.current = isSubmitting;
  }, [isSubmitting]);

  // Check initial fullscreen state and initialize
  useEffect(() => {
    if (document.fullscreenElement) {
      setHasEnteredFullscreen(true);
      setIsFullscreenActive(true);
    }
    initExamSession();
    setupAntiCheatingListeners();

    return () => {
      stopAllProtection();
    };
  }, []);

  // Timer countdown effect
  useEffect(() => {
    if (examResult) return; // Stop timer when finished

    const timer = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmitTimeExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examResult]);

  // Periodic persistence of remaining seconds
  useEffect(() => {
    if (remainingSeconds > 0 && remainingSeconds % 10 === 0) {
      db.updateParticipantSession(participant.id, { remaining_seconds: remainingSeconds });
    }
  }, [remainingSeconds]);

  // Realtime Supabase Presence Tracking for Teacher Live Monitoring
  useEffect(() => {
    const channel = getRealtimeChannel();
    if (!channel) return;

    const trackPresence = async () => {
      try {
        await channel.track({
          participant_id: participant.id,
          student_id: participant.student_id,
          student_name: participant.student?.profile?.full_name || 'Siswa',
          student_nis: participant.student?.nis || participant.student_id,
          class_name: participant.student?.class?.name || exam.class?.name || 'XII TKR',
          exam_id: exam.id,
          exam_title: exam.title,
          status: isForceSubmitted ? 'force_submitted' : (examResult ? 'submitted' : 'in_progress'),
          remaining_seconds: remainingSeconds,
          answered_count: Object.keys(answersMap).length,
          total_questions: questions.length || 25,
          tab_switch_count: participant.tab_switch_count || 0,
          cheat_warning_count: violationCount,
          last_violation: lastViolationReason,
          is_shielded: isScreenShielded,
          is_mic_active: isMicActive,
          last_active: new Date().toISOString()
        });
      } catch (e) {
        // Presence track fallback
      }
    };

    trackPresence();
    const interval = setInterval(trackPresence, 4000);
    const unsubPing = realtimeBus.subscribe('ping_active_students', () => {
      trackPresence();
      db.updateParticipantSession(participant.id, {
        status: isForceSubmitted ? 'force_submitted' : (examResult ? 'submitted' : 'in_progress'),
        remaining_seconds: remainingSeconds,
        cheat_warning_count: violationCount
      });
    });

    return () => {
      clearInterval(interval);
      unsubPing();
      try { channel.untrack(); } catch (e) {}
    };
  }, [remainingSeconds, answersMap, violationCount, isForceSubmitted, examResult, exam.id, participant.id, questions.length, isScreenShielded, isMicActive, lastViolationReason]);

  const initExamSession = async () => {
    let qList = exam.questions || (await db.getQuestions());
    if (exam.randomize_questions) {
      // Deterministic or pseudorandom shuffle
      qList = [...qList].sort(() => 0.5 - Math.random());
    }
    setQuestions(qList);

    // Load existing answers
    const existingAnswers = await db.getAnswers(participant.id);
    const mapped: Record<string, any> = {};
    existingAnswers.forEach(a => {
      mapped[a.question_id] = {
        selected_option_ids: a.selected_option_ids || [],
        text_answer: a.text_answer || '',
        is_marked_review: a.is_marked_review || false
      };
    });
    setAnswersMap(mapped);

    // Update status to in_progress
    if (participant.status === 'not_started') {
      await db.updateParticipantSession(participant.id, {
        status: 'in_progress',
        start_time: new Date().toISOString()
      });
      await db.logEvent(
        exam.id, 
        participant.id, 
        'START_EXAM', 
        { total_questions: qList.length }, 
        participant.student?.profile?.full_name
      );
    }

    hasStartedRef.current = true;
  };

  // Stop and clean up all protections (mic, audio context, speech, timers)
  const stopAllProtection = () => {
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.abort();
        speechRecognitionRef.current = null;
      } catch {}
    }
    if (mediaStreamRef.current) {
      try {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
        mediaStreamRef.current = null;
      } catch {}
      setIsMicActive(false);
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
        audioContextRef.current = null;
      } catch {}
    }
    if (screenCheckTimerRef.current) {
      clearInterval(screenCheckTimerRef.current);
      screenCheckTimerRef.current = null;
    }
  };

  // Automated force submit if student exceeds maximum violations
  const handleAutoForceSubmit = async (finalCount: number, reasonText?: string) => {
    if (isSubmittingRef.current || examResultRef.current) return;
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    stopAllProtection();

    try {
      await db.logEvent(
        exam.id,
        participant.id,
        'FORCE_SUBMIT',
        { 
          reason: reasonText || `Ujian dikunci otomatis karena melanggar batas maksimal integritas (${finalCount}x).`,
          force_submitted: true 
        },
        participant.student?.profile?.full_name
      );

      const res = await db.submitExam(participant.id, 'force_submitted');
      examResultRef.current = res;
      setExamResult(res);
      setIsForceSubmitted(true);
      setTabSwitchWarningOpen(false);
      setFullscreenWarningOpen(false);
      setMultiScreenWarningOpen(false);
      setVoiceAiWarningOpen(false);
      setIsScreenShielded(false);
    } catch (e) {
      console.error('Failed to auto-submit breached exam:', e);
    } finally {
      setIsSubmitting(false);
      isSubmittingRef.current = false;
    }
  };

  // 1. Trigger Tab Switch / Window Blur Breach
  const triggerTabSwitchViolation = (reason?: string) => {
    if (!hasStartedRef.current || examResultRef.current || isSubmittingRef.current) return;
    const now = Date.now();
    if (now - lastViolationTimeRef.current < 1500) return; // Debounce fast consecutive blurs
    lastViolationTimeRef.current = now;

    const note = reason || 'Membuka tab baru / beralih jendela aplikasi';
    setLastViolationReason(note);

    setViolationCount((prev) => {
      const next = prev + 1;
      db.logEvent(
        exam.id,
        participant.id,
        'TAB_SWITCH',
        { 
          count: next, 
          max: MAX_STRIKES, 
          time: new Date().toLocaleTimeString('id-ID'),
          note: `${note} (${next}x)`,
          student_name: participant.student?.profile?.full_name || 'Peserta',
          nis: participant.student?.nis || '-',
          exam_title: exam.title,
          class_name: exam.class?.name || 'Kelas'
        },
        participant.student?.profile?.full_name
      );

      if (next >= MAX_STRIKES) {
        handleAutoForceSubmit(next, note);
      } else {
        setTabSwitchWarningOpen(true);
      }
      return next;
    });
  };

  // 2. Trigger Multi-Screen / Split Screen Breach
  const triggerMultiScreenViolation = (reason: string) => {
    if (!hasStartedRef.current || examResultRef.current || isSubmittingRef.current) return;
    const now = Date.now();
    if (now - lastViolationTimeRef.current < 2000) return;
    lastViolationTimeRef.current = now;

    setLastViolationReason(reason);
    setIsScreenShielded(true);

    setViolationCount((prev) => {
      const next = prev + 1;
      db.logEvent(
        exam.id,
        participant.id,
        'MULTI_SCREEN_SPLIT',
        { 
          count: next, 
          max: MAX_STRIKES, 
          time: new Date().toLocaleTimeString('id-ID'),
          note: `${reason} (${next}x)`,
          student_name: participant.student?.profile?.full_name || 'Peserta',
          nis: participant.student?.nis || '-',
          exam_title: exam.title,
          class_name: exam.class?.name || 'Kelas'
        },
        participant.student?.profile?.full_name
      );

      if (next >= MAX_STRIKES) {
        handleAutoForceSubmit(next, reason);
      } else {
        setMultiScreenWarningOpen(true);
      }
      return next;
    });
  };

  // 3. Trigger Voice AI & Speech Breach
  const triggerVoiceAiViolation = (reason: string, transcriptText?: string) => {
    if (!hasStartedRef.current || examResultRef.current || isSubmittingRef.current) return;
    const now = Date.now();
    if (now - lastViolationTimeRef.current < 2500) return;
    lastViolationTimeRef.current = now;

    setDetectedVoiceText(transcriptText || reason);
    setLastViolationReason(`Voice AI: ${transcriptText || reason}`);

    setViolationCount((prev) => {
      const next = prev + 1;
      db.logEvent(
        exam.id,
        participant.id,
        'VOICE_AI_DETECTED',
        { 
          count: next, 
          max: MAX_STRIKES, 
          time: new Date().toLocaleTimeString('id-ID'),
          note: `${reason} (${next}x)`,
          transcript: transcriptText || reason,
          student_name: participant.student?.profile?.full_name || 'Peserta',
          nis: participant.student?.nis || '-',
          exam_title: exam.title,
          class_name: exam.class?.name || 'Kelas'
        },
        participant.student?.profile?.full_name
      );

      if (next >= MAX_STRIKES) {
        handleAutoForceSubmit(next, reason);
      } else {
        setVoiceAiWarningOpen(true);
      }
      return next;
    });
  };

  // Voice AI Protection: In-browser mic recording disabled to prevent false 'buka tab' triggers from OS audio overlays & mic dialogs.
  // Any external voice apps/notes used by students are cleanly and reliably caught by Window Blur & Fullscreen enforcement.
  const startVoiceAiProtection = async () => {
    // Disabled to prevent browser mic permission prompts and false 'buka tab' triggers
  };

  // Screen Integrity & Multi-Screen Checker
  const checkScreenIntegrity = () => {
    if (!hasStartedRef.current || examResultRef.current || isSubmittingRef.current) return;

    // 1. Android Split Screen & Floating Pop-up Window detection
    const activeTag = (document.activeElement as HTMLElement)?.tagName;
    const isTyping = activeTag === 'INPUT' || activeTag === 'TEXTAREA';

    const isMobileOrTablet = window.innerWidth <= 1024 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobileOrTablet && !isTyping && window.screen.availHeight > 500) {
      const heightRatio = window.innerHeight / window.screen.availHeight;
      const isPortrait = window.screen.availHeight >= window.screen.availWidth;
      // When screen is split into half (top/bottom)
      if (heightRatio < 0.68 || (isPortrait && window.innerHeight < 420)) {
        triggerMultiScreenViolation('Mode Layar Belah (Split Screen) atau Floating Pop-up terdeteksi');
        return;
      }
    }

    // 2. Desktop Multi-Monitor / Extended Display detection
    if ((window.screen as any)?.isExtended) {
      triggerMultiScreenViolation('Terdeteksi layar ganda / monitor eksternal aktif');
      return;
    }

    // 3. Fullscreen check
    if (document.fullscreenElement) {
      setIsFullscreenActive(true);
    }
  };

  const setupAntiCheatingListeners = () => {
    // 1. Visibility change (Switching tab, minimizing window)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        wasBlurredRef.current = true;
        setIsScreenShielded(true); // IMMEDIATELY SHIELD QUESTIONS SO CANNOT READ BEHIND POPUP
      } else {
        if (wasBlurredRef.current) {
          wasBlurredRef.current = false;
          triggerTabSwitchViolation('Membuka tab baru / beralih aplikasi');
        }
      }
    };

    // 2. Window blur & focus (Opening floating window, split screen, clicking outside browser)
    const handleWindowBlur = () => {
      wasBlurredRef.current = true;
      setIsScreenShielded(true); // IMMEDIATELY SHIELD QUESTIONS!
    };

    const handleWindowFocus = () => {
      if (wasBlurredRef.current) {
        wasBlurredRef.current = false;
        triggerTabSwitchViolation('Kehilangan fokus layar (Membuka aplikasi lain)');
      }
    };

    // 3. Fullscreen monitor
    const handleFullscreenChange = () => {
      if (document.fullscreenElement) {
        setIsFullscreenActive(true);
        setFullscreenWarningOpen(false);
      } else {
        setIsFullscreenActive(false);
        if (hasStartedRef.current && !examResultRef.current && !isSubmittingRef.current) {
          setFullscreenWarningOpen(true);
          setIsScreenShielded(true);
          db.logEvent(
            exam.id,
            participant.id,
            'FULLSCREEN_EXIT',
            { time: new Date().toLocaleTimeString('id-ID') },
            participant.student?.profile?.full_name
          );
        }
      }
    };

    // 4. Online / Offline connection
    const handleOnline = () => {
      setSaveStatus('saved');
      db.logEvent(
        exam.id,
        participant.id,
        'CONNECTION_RESTORED',
        {},
        participant.student?.profile?.full_name
      );
    };

    const handleOffline = () => {
      setSaveStatus('offline');
      db.logEvent(
        exam.id,
        participant.id,
        'CONNECTION_LOST',
        {},
        participant.student?.profile?.full_name
      );
    };

    // 5. Window Resize listener for Split Screen
    const handleResize = () => {
      checkScreenIntegrity();
    };

    // 6. Prevent shortcut keys (DevTools, Inspect, Copy-Paste, Save, Print, Refresh)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (examResultRef.current) return;

      // F12 Developer Tools
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }

      // Ctrl+Shift+I / J / C (DevTools)
      if (e.ctrlKey && e.shiftKey && ['i', 'I', 'j', 'J', 'c', 'C'].includes(e.key)) {
        e.preventDefault();
        return false;
      }

      // Ctrl+U (View Page Source)
      if (e.ctrlKey && (e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
        return false;
      }

      // Ctrl+P (Print) / Ctrl+S (Save)
      if (e.ctrlKey && ['p', 'P', 's', 'S'].includes(e.key)) {
        e.preventDefault();
        return false;
      }

      // Copy-Paste prevention (unless inside an input field)
      if (e.ctrlKey && ['c', 'C', 'v', 'V'].includes(e.key)) {
        const isInput = (e.target as HTMLElement)?.tagName === 'TEXTAREA' || (e.target as HTMLElement)?.tagName === 'INPUT';
        if (!isInput) {
          e.preventDefault();
          return false;
        }
      }

      // F5 / Ctrl+R refresh prevention
      if (e.key === 'F5' || (e.ctrlKey && (e.key === 'r' || e.key === 'R'))) {
        e.preventDefault();
        return false;
      }
    };

    // 7. Right-click context menu prevention
    const handleContextMenu = (e: MouseEvent) => {
      if (!examResultRef.current) {
        e.preventDefault();
        return false;
      }
    };

    // 8. Prevent accidental tab close or page reload
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasStartedRef.current && !examResultRef.current && !isSubmittingRef.current) {
        e.preventDefault();
        e.returnValue = 'Ujian sedang berlangsung! Jika Anda keluar atau me-refresh, lembar ujian dapat dikunci otomatis.';
        return e.returnValue;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('resize', handleResize);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Run continuous screen integrity check every 1.5 seconds
    screenCheckTimerRef.current = setInterval(checkScreenIntegrity, 1500);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (screenCheckTimerRef.current) clearInterval(screenCheckTimerRef.current);
    };
  };

  // Fullscreen Gateway activation handler
  const handleEnterExamFullscreen = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch {}
    setHasEnteredFullscreen(true);
    setIsFullscreenActive(true);
    setIsScreenShielded(false);
  };

  const currentQ = questions[currentIndex];

  // Save answer handler with auto-save badge
  const handleSelectOption = async (optionId: string) => {
    if (!currentQ) return;
    setSaveStatus('saving');

    const currentAns = answersMap[currentQ.id] || {
      selected_option_ids: [],
      text_answer: '',
      is_marked_review: false
    };

    let newSelected: string[] = [];
    if (currentQ.question_type === 'pg_kompleks') {
      if (currentAns.selected_option_ids.includes(optionId)) {
        newSelected = currentAns.selected_option_ids.filter(id => id !== optionId);
      } else {
        newSelected = [...currentAns.selected_option_ids, optionId];
      }
    } else {
      newSelected = [optionId];
    }

    const updatedAns = { ...currentAns, selected_option_ids: newSelected };
    setAnswersMap(prev => ({ ...prev, [currentQ.id]: updatedAns }));

    try {
      await db.saveAnswer({
        participant_id: participant.id,
        question_id: currentQ.id,
        selected_option_ids: newSelected,
        text_answer: currentAns.text_answer,
        is_marked_review: currentAns.is_marked_review
      });
      setSaveStatus('saved');
    } catch {
      setSaveStatus('offline');
    }
  };

  const handleTextAnswerChange = async (text: string) => {
    if (!currentQ) return;
    setSaveStatus('saving');

    const currentAns = answersMap[currentQ.id] || {
      selected_option_ids: [],
      text_answer: '',
      is_marked_review: false
    };

    const updatedAns = { ...currentAns, text_answer: text };
    setAnswersMap(prev => ({ ...prev, [currentQ.id]: updatedAns }));

    try {
      await db.saveAnswer({
        participant_id: participant.id,
        question_id: currentQ.id,
        selected_option_ids: [],
        text_answer: text,
        is_marked_review: currentAns.is_marked_review
      });
      setSaveStatus('saved');
    } catch {
      setSaveStatus('offline');
    }
  };

  const handleToggleReview = async () => {
    if (!currentQ) return;
    const currentAns = answersMap[currentQ.id] || {
      selected_option_ids: [],
      text_answer: '',
      is_marked_review: false
    };

    const updatedReview = !currentAns.is_marked_review;
    const updatedAns = { ...currentAns, is_marked_review: updatedReview };
    setAnswersMap(prev => ({ ...prev, [currentQ.id]: updatedAns }));

    await db.saveAnswer({
      participant_id: participant.id,
      question_id: currentQ.id,
      selected_option_ids: currentAns.selected_option_ids,
      text_answer: currentAns.text_answer,
      is_marked_review: updatedReview
    });
  };

  // Submit Exam
  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await db.submitExam(participant.id);
      setExamResult(res);
      setIsSubmitModalOpen(false);

      if (res.passed) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAutoSubmitTimeExpired = async () => {
    try {
      const res = await db.submitExam(participant.id);
      setExamResult(res);
    } catch (e) {
      console.error(e);
    }
  };

  // Format seconds to HH:MM:SS
  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Answer statistics
  const answeredCount = questions.filter(q => {
    const a = answersMap[q.id];
    return a && (a.selected_option_ids.length > 0 || (a.text_answer && a.text_answer.trim().length > 0));
  }).length;

  const markedCount = questions.filter(q => answersMap[q.id]?.is_marked_review).length;
  const unansweredCount = questions.length - answeredCount;

  // Post-submission Screen
  if (examResult) {
    return (
      <div className="min-h-screen min-h-[100dvh] bg-slate-900 text-white flex items-center justify-center p-3.5 sm:p-6 overflow-y-auto">
        <div className="max-w-xl w-full bg-slate-800 rounded-2xl sm:rounded-3xl border border-slate-700 p-5 sm:p-8 text-center shadow-2xl space-y-5 sm:space-y-6 animate-in zoom-in-95 my-auto max-h-[94vh] overflow-y-auto">
          <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto border ${
            isForceSubmitted 
              ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' 
              : examResult.passed 
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' 
                : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
          }`}>
            {isForceSubmitted ? (
              <Lock className="w-7 h-7 sm:w-8 sm:h-8 text-rose-400" />
            ) : examResult.passed ? (
              <Trophy className="w-7 h-7 sm:w-8 sm:h-8 text-amber-400" />
            ) : (
              <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-400" />
            )}
          </div>

          <div>
            <span className={`text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest px-2.5 sm:px-3 py-1 rounded-full ${
              isForceSubmitted 
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' 
                : 'bg-slate-700 text-slate-300'
            }`}>
              {isForceSubmitted ? '🛑 Ujian Dikunci Otomatis (Force Submitted)' : 'Ujian Berhasil Dikumpulkan'}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-2.5 sm:mt-3 tracking-tight">
              {exam.title}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Peserta: {participant.student?.profile?.full_name} ({participant.student?.nis})
            </p>
            {isForceSubmitted && (
              <div className="mt-3 p-3 rounded-2xl bg-rose-950/70 border border-rose-800/80 text-rose-200 text-xs flex items-center gap-2.5 text-left">
                <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0" />
                <p className="leading-relaxed text-[11px] sm:text-xs">
                  Sistem mengunci dan mengumpulkan lembar ujian Anda karena terdeteksi berpindah tab / jendela lain sebanyak <strong>{MAX_STRIKES} kali</strong>.
                </p>
              </div>
            )}
          </div>

          {exam.show_results_immediately ? (
            <div className="p-4 sm:p-6 bg-slate-900/80 rounded-2xl border border-slate-700 space-y-3.5 sm:space-y-4">
              <p className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Nilai Akhir Ujian Anda
              </p>
              <div className="text-4xl sm:text-5xl font-black text-sky-400 font-mono">
                {examResult.total_score}
              </div>

              <div className="grid grid-cols-3 gap-2 text-center pt-3 border-t border-slate-800">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Benar</p>
                  <p className="text-sm sm:text-base font-extrabold text-emerald-400">{examResult.correct_count}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Salah</p>
                  <p className="text-sm sm:text-base font-extrabold text-rose-400">{examResult.wrong_count}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">KKM</p>
                  <p className="text-sm sm:text-base font-extrabold text-amber-400">{exam.kkm}</p>
                </div>
              </div>

              <div className="pt-1 sm:pt-2">
                <span
                  className={`inline-block px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider ${
                    examResult.passed
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}
                >
                  {examResult.passed ? 'KOMPETEN / LULUS KKM' : 'BELUM TERCAPAI (PROGRAM REMEDIAL)'}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-4 sm:p-6 bg-slate-900/60 rounded-2xl border border-slate-700 text-xs text-slate-300 leading-relaxed">
              Jawaban Anda telah tersimpan secara aman di server CBT SMK Mitra. Nilai dan hasil evaluasi akan diumumkan secara resmi oleh guru pengampu setelah batas waktu ujian selesai.
            </div>
          )}

          <button
            onClick={onExitExam}
            className="w-full py-3.5 sm:py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs sm:text-sm tracking-wide transition shadow-lg shadow-brand-600/30 min-h-[46px] active:scale-[0.99]"
          >
            Kembali ke Beranda Siswa
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-slate-100 flex flex-col cbt-unselectable font-sans select-none"
      translate="no"
      onContextMenu={(e) => e.preventDefault()}
      onCopy={(e) => e.preventDefault()}
      onCut={(e) => e.preventDefault()}
      onPaste={(e) => e.preventDefault()}
    >
      {/* 1. Exam Header (MITRA CBT Distraction-free) */}
      <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-2.5 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
          {/* Brand & Exam Title */}
          <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-brand-600 flex items-center justify-center font-black text-white text-xs sm:text-base shrink-0 shadow-sm shadow-brand-500/30">
              M
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-bold text-xs sm:text-sm tracking-tight text-white truncate max-w-[100px] sm:max-w-[260px] block">
                  {exam.title}
                </span>
                <span className="hidden sm:inline-block text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-brand-950 text-sky-400 border border-brand-800 uppercase shrink-0">
                  CBT SISWA
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 truncate max-w-[100px] sm:max-w-none">
                {participant.student?.profile?.full_name}
              </p>
            </div>
          </div>

          {/* Center: Server-side countdown timer */}
          <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl sm:rounded-2xl bg-slate-800 border border-slate-700 shadow-inner shrink-0">
            <Clock className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${remainingSeconds < 300 ? 'text-rose-400 animate-bounce' : 'text-amber-400'}`} />
            <span
              className={`font-mono font-black text-xs sm:text-sm tracking-wider ${
                remainingSeconds < 300 ? 'text-rose-400' : 'text-slate-100'
              }`}
            >
              {formatTime(remainingSeconds)}
            </span>
          </div>

          {/* Right Controls: Anti-cheat badge, Auto-save badge & Question count */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Voice AI Protection Active Badge */}
            <div className={`hidden sm:flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-xl text-[10px] sm:text-[11px] font-bold border transition ${
              isMicActive 
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80' 
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}>
              <Mic className={`w-3.5 h-3.5 ${isMicActive ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`} />
              <span className="hidden lg:inline">{isMicActive ? 'Voice AI Guard: Aktif' : 'Voice Guard: Standby'}</span>
            </div>

            {/* Anti-Cheat Realtime Security Badge */}
            <div className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold border transition ${
              violationCount === 0
                ? 'bg-emerald-950/70 text-emerald-300 border-emerald-800'
                : violationCount === 1
                  ? 'bg-amber-950/80 text-amber-300 border-amber-700'
                  : 'bg-rose-950 text-rose-300 border-rose-600 animate-pulse'
            }`}>
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Anti-Cheat:</span>
              <span className="font-mono">
                {violationCount}/{MAX_STRIKES} Pelanggaran
              </span>
            </div>
            {/* Auto-save Status Badge */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold">
              {saveStatus === 'saved' && (
                <span className="inline-flex items-center gap-1 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  Tersimpan
                </span>
              )}
              {saveStatus === 'saving' && (
                <span className="inline-flex items-center gap-1 text-amber-400 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  Menyimpan...
                </span>
              )}
              {saveStatus === 'offline' && (
                <span className="inline-flex items-center gap-1 text-rose-400">
                  <WifiOff className="w-3.5 h-3.5" />
                  Mode Offline (Lokal)
                </span>
              )}
            </div>

            {/* Progress Counter */}
            <div className="px-2 sm:px-3 py-1 rounded-xl bg-slate-800 text-[11px] sm:text-xs font-extrabold text-slate-200 border border-slate-700">
              {currentIndex + 1} / {questions.length}
            </div>

            {/* Question Palette Toggle (Mobile/Tablet) */}
            <button
              onClick={() => setPaletteOpen(!paletteOpen)}
              className="lg:hidden p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition active:scale-95 flex items-center gap-1"
              aria-label="Buka Daftar Nomor Soal"
            >
              <Layers className="w-4 h-4 text-sky-400" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Examination Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 items-start">
        {/* Left Column (3 Cols): Question Card & Options */}
        <div className="lg:col-span-3 space-y-4 sm:space-y-5">
          {currentQ ? (
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-4 sm:p-6 lg:p-8 shadow-xs space-y-4 sm:space-y-6">
              {/* Question Header */}
              <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100 flex-wrap gap-2">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="px-2.5 sm:px-3 py-1 rounded-xl bg-brand-600 text-white font-black text-xs sm:text-sm">
                    Soal No. {currentIndex + 1}
                  </span>
                  <span className="px-2 py-0.5 rounded-lg text-[10px] sm:text-xs font-bold bg-slate-100 text-slate-700 uppercase">
                    {currentQ.question_type.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleToggleReview}
                    className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition border touch-manipulation active:scale-95 ${
                      answersMap[currentQ.id]?.is_marked_review
                        ? 'bg-amber-100 text-amber-800 border-amber-300 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${answersMap[currentQ.id]?.is_marked_review ? 'fill-amber-500 text-amber-500' : ''}`} />
                    <span>{answersMap[currentQ.id]?.is_marked_review ? 'Ragu-ragu (Ditandai)' : 'Tandai Ragu-ragu'}</span>
                  </button>
                </div>
              </div>

              {/* Technical Diagram Image if available */}
              {currentQ.image_url && (
                <div className="p-2 sm:p-4 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-200 flex flex-col items-center gap-2">
                  <img
                    src={currentQ.image_url}
                    alt="Diagram Soal"
                    className="max-h-52 sm:max-h-72 w-full object-contain rounded-lg shadow-xs bg-white border border-slate-200"
                  />
                  <button
                    type="button"
                    onClick={() => setPreviewImage(currentQ.image_url!)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs mt-1 active:scale-95 touch-manipulation"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                    <span>Klik untuk Perbesar Diagram</span>
                  </button>
                </div>
              )}

              {/* Question Text */}
              <div className="text-sm sm:text-base font-semibold text-slate-800 leading-relaxed break-words">
                {currentQ.content}
              </div>

              {/* Options Selection */}
              {currentQ.question_type !== 'isian_singkat' ? (
                <div className="space-y-2.5 sm:space-y-3 pt-1 sm:pt-2">
                  {currentQ.options.map((opt) => {
                    const isSelected = answersMap[currentQ.id]?.selected_option_ids?.includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSelectOption(opt.id)}
                        className={`w-full text-left p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition flex items-start gap-3 active:scale-[0.99] touch-manipulation min-h-[48px] ${
                          isSelected
                            ? 'border-brand-500 bg-brand-50/60 shadow-xs ring-1 ring-brand-500/20'
                            : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                        }`}
                      >
                        <span
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition ${
                            isSelected
                              ? 'bg-brand-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {opt.option_label}
                        </span>
                        <div className="flex-1 pt-0.5 sm:pt-1 text-xs sm:text-sm font-medium text-slate-800 leading-relaxed break-words">
                          {opt.content}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                /* Isian Singkat Input */
                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                    Ketik Jawaban Singkat Anda:
                  </label>
                  <input
                    type="text"
                    value={answersMap[currentQ.id]?.text_answer || ''}
                    onChange={(e) => handleTextAnswerChange(e.target.value)}
                    placeholder="Tuliskan jawaban Anda di sini..."
                    className="w-full text-base sm:text-sm font-semibold p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border-2 border-slate-200 focus:border-brand-500 focus:outline-none bg-slate-50 min-h-[48px]"
                  />
                </div>
              )}

              {/* Navigation Controls: Previous / Next / Submit */}
              <div className="flex items-center justify-between pt-4 sm:pt-6 border-t border-slate-100 gap-2 sm:gap-3">
                <button
                  type="button"
                  disabled={currentIndex === 0 || !exam.allow_backward}
                  onClick={() => setCurrentIndex(prev => prev - 1)}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-3 sm:py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition min-h-[44px] active:scale-[0.98] touch-manipulation"
                >
                  <ChevronLeft className="w-4 h-4 shrink-0" />
                  <span>Sebelumnya</span>
                </button>

                {/* Quick Palette Button on Phone */}
                <button
                  type="button"
                  onClick={() => setPaletteOpen(true)}
                  className="lg:hidden p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition min-h-[44px] flex items-center justify-center gap-1.5 px-3 shrink-0"
                  title="Buka Daftar Nomor Soal"
                >
                  <Layers className="w-4 h-4 text-brand-600" />
                  <span className="hidden xs:inline">No. Soal</span>
                </button>

                {currentIndex < questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentIndex(prev => prev + 1)}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-3 sm:py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-brand-600/20 transition min-h-[44px] active:scale-[0.98] touch-manipulation"
                  >
                    <span>Selanjutnya</span>
                    <ChevronRight className="w-4 h-4 shrink-0" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsSubmitModalOpen(true)}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-3 sm:py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/25 transition min-h-[44px] active:scale-[0.98] touch-manipulation"
                  >
                    <Send className="w-4 h-4 shrink-0" />
                    <span>Kumpulkan</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-10 sm:p-12 text-center bg-white rounded-2xl sm:rounded-3xl border border-slate-200">
              <p className="text-xs text-slate-500">Memuat butir soal asesmen...</p>
            </div>
          )}
        </div>

        {/* Backdrop overlay for mobile drawer */}
        {paletteOpen && (
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden animate-in fade-in"
            onClick={() => setPaletteOpen(false)}
          />
        )}

        {/* Right Column (1 Col): Question Navigation Palette */}
        <div
          className={`lg:col-span-1 fixed lg:static inset-y-0 right-0 z-50 lg:z-auto w-80 max-w-[88vw] lg:w-auto bg-white rounded-l-2xl sm:rounded-l-3xl lg:rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-2xl lg:shadow-xs flex flex-col justify-between space-y-3 sm:space-y-4 transition-transform duration-200 ease-out pb-safe ${
            paletteOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-brand-600" />
              Daftar Nomor Soal
            </h4>
            <button
              onClick={() => setPaletteOpen(false)}
              className="lg:hidden text-xs text-slate-500 hover:text-slate-900 font-bold px-2 py-1 rounded-lg bg-slate-100"
            >
              ✕ Tutup
            </button>
          </div>

          {/* Palette Grid */}
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2 max-h-[calc(100vh-250px)] lg:max-h-80 overflow-y-auto p-1 touch-scroll">
            {questions.map((q, idx) => {
              const ans = answersMap[q.id];
              const isAnswered = ans && (ans.selected_option_ids?.length > 0 || (ans.text_answer && ans.text_answer.trim().length > 0));
              const isMarked = ans?.is_marked_review;
              const isActive = idx === currentIndex;

              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => {
                    setCurrentIndex(idx);
                    setPaletteOpen(false);
                  }}
                  className={`w-full aspect-square min-h-[38px] rounded-xl flex flex-col items-center justify-center font-bold text-xs transition relative touch-manipulation active:scale-95 ${
                    isActive ? 'ring-2 ring-brand-500 ring-offset-2 scale-105 z-10' : ''
                  } ${
                    isMarked
                      ? 'bg-amber-400 text-slate-950 font-black'
                      : isAnswered
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>{idx + 1}</span>
                  {isMarked && (
                    <Bookmark className="w-2.5 h-2.5 absolute top-1 right-1 fill-amber-900 text-amber-900" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Color Legend */}
          <div className="pt-2.5 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-600">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-md bg-emerald-600 shrink-0"></span>
              <span>Sudah dijawab ({answeredCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-md bg-amber-400 shrink-0"></span>
              <span>Ragu-ragu / Ditandai ({markedCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-md bg-slate-200 shrink-0"></span>
              <span>Belum dijawab ({unansweredCount})</span>
            </div>
          </div>

          {/* Pre-submit Shortcut Button in Palette */}
          <button
            type="button"
            onClick={() => setIsSubmitModalOpen(true)}
            className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm transition shadow-sm min-h-[44px] active:scale-[0.98] touch-manipulation"
          >
            Selesaikan & Kumpulkan
          </button>
        </div>
      </main>

      {/* Pre-submit Review Confirmation Dialog */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-3.5 sm:p-4 animate-in fade-in overflow-y-auto">
          <div className="max-w-md w-full bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-2xl space-y-4 sm:space-y-5 text-center my-auto max-h-[92vh] overflow-y-auto">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                Konfirmasi Pengumpulan Ujian
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Pastikan Anda telah memeriksa kembali seluruh jawaban sebelum mengirimkan.
              </p>
            </div>

            {/* Breakdown Summary */}
            <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Total Soal</p>
                <p className="text-base font-black text-slate-800">{questions.length}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-emerald-600">Terjawab</p>
                <p className="text-base font-black text-emerald-600">{answeredCount}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-rose-600">Belum</p>
                <p className="text-base font-black text-rose-600">{unansweredCount}</p>
              </div>
            </div>

            {unansweredCount > 0 && (
              <p className="text-xs text-rose-600 font-semibold bg-rose-50 p-2.5 rounded-xl border border-rose-200 leading-relaxed">
                Peringatan: Masih terdapat {unansweredCount} butir soal yang belum Anda jawab!
              </p>
            )}

            <div className="flex items-center gap-2.5 sm:gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(false)}
                className="flex-1 py-3 sm:py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 min-h-[44px] active:scale-[0.98]"
              >
                Periksa Lagi
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleFinalSubmit}
                className="flex-1 py-3 sm:py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 min-h-[44px] active:scale-[0.98]"
              >
                {isSubmitting ? 'Mengirim...' : 'Ya, Kumpulkan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Violation Warning Modal */}
      {fullscreenWarningOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-3.5 sm:p-4 animate-in fade-in overflow-y-auto">
          <div className="max-w-md w-full bg-white rounded-2xl sm:rounded-3xl border border-rose-200 p-5 sm:p-6 shadow-2xl text-center space-y-4 my-auto max-h-[92vh] overflow-y-auto">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Peringatan Sistem Integritas Ujian!
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Anda terdeteksi keluar dari mode layar penuh (fullscreen). Kejadian ini telah dicatat secara otomatis ke server monitoring pengawas.
              </p>
            </div>

            <button
              onClick={() => {
                setFullscreenWarningOpen(false);
                if (document.documentElement.requestFullscreen) {
                  document.documentElement.requestFullscreen().catch(() => {});
                }
              }}
              className="w-full py-3 rounded-xl bg-slate-900 text-white text-xs sm:text-sm font-bold hover:bg-slate-800 transition min-h-[44px] active:scale-[0.98]"
            >
              Kembali ke Layar Penuh & Lanjutkan
            </button>
          </div>
        </div>
      )}

      {/* Tab Switch / Blur Violation Modal (Strike Warning) */}
      {tabSwitchWarningOpen && !isForceSubmitted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-3.5 sm:p-4 animate-in fade-in overflow-y-auto">
          <div className="max-w-md w-full bg-white rounded-2xl sm:rounded-3xl border-2 border-rose-500 p-5 sm:p-7 shadow-2xl text-center space-y-4 sm:space-y-5 my-auto max-h-[92vh] overflow-y-auto">
            {/* Warning Icon with Pulse */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/20">
              <ShieldAlert className="w-7 h-7 sm:w-8 sm:h-8 animate-bounce" />
            </div>

            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-700 border border-rose-200">
                🚨 PELANGGARAN TERDETEKSI
              </span>
              <h3 className="text-base sm:text-lg font-black text-slate-900 mt-2 tracking-tight">
                Anda Meninggalkan Halaman Ujian!
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Anda terdeteksi berpindah tab, meminimalkan browser, atau membuka aplikasi lain. Kejadian ini dicatat secara realtime ke sistem pengawas.
              </p>
            </div>

            {/* Strike Indicators */}
            <div className="p-3 sm:p-4 rounded-2xl bg-rose-50/80 border border-rose-200 space-y-2">
              <div className="flex items-center justify-center gap-2.5 sm:gap-3">
                {[1, 2, 3].map((strike) => (
                  <div key={strike} className="flex flex-col items-center gap-1">
                    <div
                      className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-black text-xs transition ${
                        strike <= violationCount
                          ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 ring-2 ring-rose-300'
                          : 'bg-white text-slate-400 border border-slate-300'
                      }`}
                    >
                      {strike}
                    </div>
                    <span className="text-[9px] font-bold text-slate-500">
                      Strike {strike}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] font-extrabold text-rose-800 pt-1">
                Peringatan {violationCount} dari {MAX_STRIKES} kali batas toleransi!
              </p>
              <p className="text-[10px] text-rose-600 font-medium leading-relaxed">
                Sisa kesempatan: <strong>{Math.max(0, MAX_STRIKES - violationCount)} kali</strong>. Jika berpindah tab lagi, ujian akan <strong>OTOMATIS DIKUNCI PERMANEN</strong>!
              </p>
            </div>

            <button
              onClick={() => {
                setTabSwitchWarningOpen(false);
                if (document.documentElement.requestFullscreen) {
                  document.documentElement.requestFullscreen().catch(() => {});
                }
              }}
              className="w-full py-3.5 sm:py-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs sm:text-sm font-bold shadow-lg shadow-rose-600/25 transition active:scale-[0.99] min-h-[46px]"
            >
              Saya Mengerti & Lanjutkan Ujian
            </button>
          </div>
        </div>
      )}

      {/* 1. Compulsory Fullscreen & Anti-Cheat Security Gateway */}
      {!hasEnteredFullscreen && !examResult && !isForceSubmitted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-4 select-none animate-in fade-in overflow-y-auto">
          <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center shadow-2xl space-y-5 sm:space-y-6 my-auto">
            <div className="w-16 h-16 rounded-3xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center mx-auto text-brand-400 shadow-lg shadow-brand-500/20">
              <ShieldAlert className="w-8 h-8 animate-pulse" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-brand-500/20 text-brand-300 border border-brand-500/30">
                SISTEM INTEGRITAS MITRA CBT
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-2.5 tracking-tight">
                Mode Ujian Aman Aktif
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
                Untuk menjamin kejujuran asesmen, sistem CBT mengaktifkan protokol pengawasan ketat:
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2.5 text-left">
              <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/70 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 shrink-0">
                  <Maximize2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-200">Mode Layar Penuh Wajib</p>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Dilarang keluar fullscreen, berpindah aplikasi, atau membuka tab browser lain.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/70 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 shrink-0">
                  <Split className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-200">Anti Split-Screen & Floating Window</p>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Dilarang membagi layar atau membuka jendela pop-up mengambang.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/70 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
                  <Mic className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-200">Sensor Suara & Anti Voice AI</p>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Mikrofon mendeteksi suara. Dilarang berbicara atau menggunakan Google Assistant, Ella, Gemini, atau Siri.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleEnterExamFullscreen}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-600 via-sky-600 to-brand-500 hover:from-brand-500 hover:to-sky-500 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-brand-500/25 active:scale-[0.98] transition flex items-center justify-center gap-2"
            >
              <Maximize2 className="w-5 h-5" />
              Masuk Mode Layar Penuh & Mulai Ujian
            </button>
          </div>
        </div>
      )}

      {/* 2. Instant Privacy Screen Shield when window is blurred or floating window opened */}
      {isScreenShielded && !tabSwitchWarningOpen && !multiScreenWarningOpen && !voiceAiWarningOpen && hasEnteredFullscreen && (
        <div className="fixed inset-0 z-40 bg-slate-950 flex flex-col items-center justify-center p-6 text-center select-none backdrop-blur-xl animate-in fade-in">
          <div className="w-16 h-16 rounded-3xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4 animate-pulse">
            <EyeOff className="w-8 h-8" />
          </div>
          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-rose-500/20 text-rose-300 border border-rose-500/40 mb-2">
            LAYAR TERLINDUNGI
          </span>
          <h2 className="text-lg sm:text-xl font-black text-white mb-2">
            Fokus Layar Ujian Terputus
          </h2>
          <p className="text-xs text-slate-400 max-w-sm mb-6 leading-relaxed">
            Terdeteksi aplikasi lain, jendela melayang (floating window), atau kehilangan fokus layar. Seluruh butir soal disembunyikan demi integritas ujian.
          </p>
          <button
            type="button"
            onClick={() => {
              setIsScreenShielded(false);
              triggerTabSwitchViolation('Membuka aplikasi lain atau floating window');
            }}
            className="px-6 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-rose-600/25 active:scale-95 transition"
          >
            Kembali ke Ujian Penuh
          </button>
        </div>
      )}

      {/* 3. Multi Screen / Split Screen Violation Modal */}
      {multiScreenWarningOpen && !isForceSubmitted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-3.5 sm:p-4 animate-in fade-in overflow-y-auto">
          <div className="max-w-md w-full bg-white rounded-2xl sm:rounded-3xl border-2 border-purple-500 p-5 sm:p-7 shadow-2xl text-center space-y-4 sm:space-y-5 my-auto max-h-[92vh] overflow-y-auto">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl bg-purple-100 text-purple-600 flex items-center justify-center mx-auto shadow-lg shadow-purple-500/20">
              <Split className="w-7 h-7 sm:w-8 sm:h-8 animate-bounce" />
            </div>

            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-700 border border-purple-200">
                📱 MULTI-SCREEN / SPLIT TERDETEKSI
              </span>
              <h3 className="text-base sm:text-lg font-black text-slate-900 mt-2 tracking-tight">
                Dilarang Menggunakan Layar Belah!
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Anda terdeteksi menggunakan split-screen, jendela mengambang (floating window), atau layar ganda. Ujian WAJIB dikerjakan dalam 1 layar penuh.
              </p>
            </div>

            {/* Strike Indicators */}
            <div className="p-3 sm:p-4 rounded-2xl bg-purple-50/80 border border-purple-200 space-y-2">
              <div className="flex items-center justify-center gap-2.5 sm:gap-3">
                {[1, 2, 3].map((strike) => (
                  <div key={strike} className="flex flex-col items-center gap-1">
                    <div
                      className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-black text-xs transition ${
                        strike <= violationCount
                          ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 ring-2 ring-purple-300'
                          : 'bg-white text-slate-400 border border-slate-300'
                      }`}
                    >
                      {strike}
                    </div>
                    <span className="text-[9px] font-bold text-slate-500">
                      Strike {strike}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] font-extrabold text-purple-800 pt-1">
                Peringatan {violationCount} dari {MAX_STRIKES} kali batas toleransi!
              </p>
              <p className="text-[10px] text-purple-600 font-medium leading-relaxed">
                Sisa kesempatan: <strong>{Math.max(0, MAX_STRIKES - violationCount)} kali</strong>. Jika terdeteksi lagi, ujian akan <strong>OTOMATIS DIKUNCI PERMANEN</strong>!
              </p>
            </div>

            <button
              onClick={() => {
                setMultiScreenWarningOpen(false);
                setIsScreenShielded(false);
                if (document.documentElement.requestFullscreen) {
                  document.documentElement.requestFullscreen().catch(() => {});
                }
              }}
              className="w-full py-3.5 sm:py-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white text-xs sm:text-sm font-bold shadow-lg shadow-purple-600/25 transition active:scale-[0.99] min-h-[46px]"
            >
              Tutup Layar Ganda & Lanjutkan Layar Penuh
            </button>
          </div>
        </div>
      )}

      {/* 4. Voice AI / Speech Violation Modal */}
      {voiceAiWarningOpen && !isForceSubmitted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-3.5 sm:p-4 animate-in fade-in overflow-y-auto">
          <div className="max-w-md w-full bg-white rounded-2xl sm:rounded-3xl border-2 border-red-500 p-5 sm:p-7 shadow-2xl text-center space-y-4 sm:space-y-5 my-auto max-h-[92vh] overflow-y-auto">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-lg shadow-red-500/20">
              <Mic className="w-7 h-7 sm:w-8 sm:h-8 animate-bounce" />
            </div>

            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-700 border border-red-200">
                🎙️ PERCAKAPAN / VOICE AI TERDETEKSI
              </span>
              <h3 className="text-base sm:text-lg font-black text-slate-900 mt-2 tracking-tight">
                Terdeteksi Suara atau Perintah Asisten AI!
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Sistem mendeteksi aktivitas suara atau interaksi asisten suara (Google Assistant, Ella, Gemini, Siri). Seluruh aktivitas ujian wajib hening tanpa suara.
              </p>
            </div>

            {detectedVoiceText && (
              <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-left">
                <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Suara / Teks Terdeteksi:</p>
                <p className="text-xs font-mono text-slate-800 bg-white p-2 rounded border border-slate-200 break-words italic">
                  "{detectedVoiceText}"
                </p>
              </div>
            )}

            {/* Strike Indicators */}
            <div className="p-3 sm:p-4 rounded-2xl bg-red-50/80 border border-red-200 space-y-2">
              <div className="flex items-center justify-center gap-2.5 sm:gap-3">
                {[1, 2, 3].map((strike) => (
                  <div key={strike} className="flex flex-col items-center gap-1">
                    <div
                      className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-black text-xs transition ${
                        strike <= violationCount
                          ? 'bg-red-600 text-white shadow-md shadow-red-600/30 ring-2 ring-red-300'
                          : 'bg-white text-slate-400 border border-slate-300'
                      }`}
                    >
                      {strike}
                    </div>
                    <span className="text-[9px] font-bold text-slate-500">
                      Strike {strike}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] font-extrabold text-red-800 pt-1">
                Peringatan {violationCount} dari {MAX_STRIKES} kali batas toleransi!
              </p>
              <p className="text-[10px] text-red-600 font-medium leading-relaxed">
                Sisa kesempatan: <strong>{Math.max(0, MAX_STRIKES - violationCount)} kali</strong>. Jika berbicara atau menggunakan asisten suara lagi, ujian akan <strong>DIKUNCI PERMANEN</strong>!
              </p>
            </div>

            <button
              onClick={() => {
                setVoiceAiWarningOpen(false);
                setIsScreenShielded(false);
                if (document.documentElement.requestFullscreen) {
                  document.documentElement.requestFullscreen().catch(() => {});
                }
              }}
              className="w-full py-3.5 sm:py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs sm:text-sm font-bold shadow-lg shadow-red-600/25 transition active:scale-[0.99] min-h-[46px]"
            >
              Saya Mengerti & Lanjutkan (Mode Hening)
            </button>
          </div>
        </div>
      )}

      {/* Image Zoom Modal */}
      <ImageModal
        isOpen={!!previewImage}
        onClose={() => setPreviewImage(null)}
        imageUrl={previewImage || ''}
      />
    </div>
  );
};
