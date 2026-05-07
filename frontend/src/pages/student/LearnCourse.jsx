import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ReactPlayer from 'react-player';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, CheckCircle, Circle, Menu, X,
  MessageSquare, FileText, BookOpen, Award, Download, StickyNote,
  Play, Lock, ChevronDown, ChevronUp,
} from 'lucide-react';
import { courseService, enrollmentService } from '../../services/api';
import { formatDuration } from '../../lib/utils';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

export default function LearnCourse() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const playerRef = useRef(null);

  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [currentSection, setCurrentSection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('content');
  const [expandedSections, setExpandedSections] = useState({});
  const [noteContent, setNoteContent] = useState('');
  const [notes, setNotes] = useState([]);
  const [videoTimestamp, setVideoTimestamp] = useState(0);
  const [savingProgress, setSavingProgress] = useState(false);

  useEffect(() => {
    loadCourse();
  }, [slug]);

  const loadCourse = async () => {
    try {
      const { data } = await courseService.getCourse(slug);
      if (!data.isEnrolled) { navigate(`/courses/${slug}`); return; }
      setCourse(data.course);
      setProgress(data.progress);

      // Set first lesson or last watched
      const lastWatched = data.progress?.lastWatched;
      let targetSection = data.course.sections[0];
      let targetLesson = targetSection?.lessons[0];

      if (lastWatched?.lesson) {
        for (const section of data.course.sections) {
          const lesson = section.lessons.find((l) => l._id === lastWatched.lesson);
          if (lesson) { targetSection = section; targetLesson = lesson; break; }
        }
      }

      if (targetSection) {
        setCurrentSection(targetSection);
        setExpandedSections({ [targetSection._id]: true });
      }
      if (targetLesson) setCurrentLesson(targetLesson);

      // Load notes
      const { data: notesData } = await enrollmentService.getNotes(data.course._id);
      setNotes(notesData.notes || []);
    } catch (err) {
      toast.error('Failed to load course');
      navigate('/my-courses');
    } finally {
      setLoading(false);
    }
  };

  const selectLesson = (section, lesson) => {
    setCurrentSection(section);
    setCurrentLesson(lesson);
    setVideoTimestamp(0);
  };

  const isLessonCompleted = (lessonId) => {
    return progress?.completedLessons?.some((l) => l.lesson === lessonId || l.lesson?._id === lessonId);
  };

  const markComplete = useCallback(async () => {
    if (!currentLesson || !course || savingProgress) return;
    setSavingProgress(true);
    try {
      const { data } = await enrollmentService.updateProgress(course._id, {
        lessonId: currentLesson._id,
        sectionId: currentSection._id,
        watchTime: Math.round(playerRef.current?.getCurrentTime() || 0),
        timestamp: 0,
      });
      setProgress((prev) => ({
        ...prev,
        completedLessons: [...(prev?.completedLessons || []), { lesson: currentLesson._id }],
        completionPercentage: data.progress.completionPercentage,
        isCompleted: data.progress.isCompleted,
      }));
      if (data.progress.isCompleted) {
        toast.success('🎉 Course completed! Certificate issued!');
      } else {
        toast.success('Lesson marked as complete!');
      }
      goToNextLesson();
    } catch (err) {
      toast.error('Failed to save progress');
    } finally {
      setSavingProgress(false);
    }
  }, [currentLesson, currentSection, course, savingProgress]);

  const goToNextLesson = () => {
    if (!course || !currentSection || !currentLesson) return;
    const sectionIdx = course.sections.findIndex((s) => s._id === currentSection._id);
    const lessonIdx = currentSection.lessons.findIndex((l) => l._id === currentLesson._id);

    if (lessonIdx < currentSection.lessons.length - 1) {
      selectLesson(currentSection, currentSection.lessons[lessonIdx + 1]);
    } else if (sectionIdx < course.sections.length - 1) {
      const nextSection = course.sections[sectionIdx + 1];
      if (nextSection.lessons.length > 0) {
        setExpandedSections((prev) => ({ ...prev, [nextSection._id]: true }));
        selectLesson(nextSection, nextSection.lessons[0]);
      }
    }
  };

  const goToPrevLesson = () => {
    if (!course || !currentSection || !currentLesson) return;
    const sectionIdx = course.sections.findIndex((s) => s._id === currentSection._id);
    const lessonIdx = currentSection.lessons.findIndex((l) => l._id === currentLesson._id);

    if (lessonIdx > 0) {
      selectLesson(currentSection, currentSection.lessons[lessonIdx - 1]);
    } else if (sectionIdx > 0) {
      const prevSection = course.sections[sectionIdx - 1];
      if (prevSection.lessons.length > 0) {
        selectLesson(prevSection, prevSection.lessons[prevSection.lessons.length - 1]);
      }
    }
  };

  const saveNote = async () => {
    if (!noteContent.trim()) return;
    try {
      const { data } = await enrollmentService.saveNote(course._id, {
        lessonId: currentLesson?._id,
        timestamp: Math.round(playerRef.current?.getCurrentTime() || 0),
        content: noteContent,
      });
      setNotes((prev) => [...prev, data.note]);
      setNoteContent('');
      toast.success('Note saved!');
    } catch {
      toast.error('Failed to save note');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>;
  if (!course) return null;

  const completedCount = progress?.completedLessons?.length || 0;
  const totalLessons = course.sections?.reduce((acc, s) => acc + s.lessons.length, 0) || 1;
  const completionPct = Math.round((completedCount / totalLessons) * 100);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-gray-900 text-white px-4 h-14 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center gap-3">
          <Link to="/my-courses" className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-sm font-semibold line-clamp-1">{course.title}</h1>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>{completedCount}/{totalLessons} lessons</span>
              <div className="w-24 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-brand-500 rounded-full transition-all" style={{ width: `${completionPct}%` }} />
              </div>
              <span>{completionPct}%</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {progress?.isCompleted && (
            <Link to="/certificates" className="flex items-center gap-1 text-xs bg-amber-500 hover:bg-amber-400 px-3 py-1.5 rounded-lg transition-colors">
              <Award className="w-3 h-3" /> Certificate
            </Link>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          {/* Video player */}
          {currentLesson?.type === 'video' && currentLesson?.video?.url ? (
            <div className="bg-black aspect-video w-full">
              <ReactPlayer
                ref={playerRef}
                url={currentLesson.video.url}
                width="100%"
                height="100%"
                controls
                onProgress={({ playedSeconds }) => setVideoTimestamp(Math.round(playedSeconds))}
                onEnded={markComplete}
                config={{ file: { attributes: { controlsList: 'nodownload' } } }}
              />
            </div>
          ) : currentLesson?.type === 'text' ? (
            <div className="max-w-3xl mx-auto p-6">
              <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed whitespace-pre-line">
                {currentLesson.content}
              </div>
            </div>
          ) : (
            <div className="aspect-video bg-gray-900 flex items-center justify-center">
              <div className="text-center text-white">
                <Play className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-gray-400">Select a lesson to start learning</p>
              </div>
            </div>
          )}

          {/* Lesson info */}
          {currentLesson && (
            <div className="max-w-4xl mx-auto p-4 sm:p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-xl font-bold">{currentLesson.title}</h2>
                  {currentLesson.description && (
                    <p className="text-muted-foreground text-sm mt-1">{currentLesson.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={goToPrevLesson} className="p-2 border border-border rounded-lg hover:bg-muted transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={markComplete}
                    disabled={savingProgress || isLessonCompleted(currentLesson._id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isLessonCompleted(currentLesson._id)
                        ? 'bg-green-100 text-green-700 cursor-default'
                        : 'bg-brand-600 hover:bg-brand-700 text-white'
                    }`}
                  >
                    {savingProgress ? <LoadingSpinner size="sm" /> : <CheckCircle className="w-4 h-4" />}
                    {isLessonCompleted(currentLesson._id) ? 'Completed' : 'Mark Complete'}
                  </button>
                  <button onClick={goToNextLesson} className="p-2 border border-border rounded-lg hover:bg-muted transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 border-b border-border mb-4">
                {[
                  { id: 'content', label: 'Overview', icon: BookOpen },
                  { id: 'notes', label: 'Notes', icon: StickyNote },
                  { id: 'resources', label: 'Resources', icon: Download },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                        activeTab === tab.id ? 'border-brand-600 text-brand-600' : 'border-transparent text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" /> {tab.label}
                    </button>
                  );
                })}
              </div>

              {activeTab === 'content' && (
                <div className="text-sm text-muted-foreground leading-relaxed">
                  {currentLesson.description || 'No additional content for this lesson.'}
                </div>
              )}

              {activeTab === 'notes' && (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <textarea
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      placeholder="Add a note at this timestamp..."
                      rows={3}
                      className="input-field flex-1 resize-none text-sm"
                    />
                    <button onClick={saveNote} className="btn-primary px-4 self-start">Save</button>
                  </div>
                  <div className="space-y-2">
                    {notes.filter((n) => n.lesson === currentLesson._id).map((note) => (
                      <div key={note._id} className="bg-muted/50 rounded-lg p-3 text-sm">
                        <div className="text-xs text-muted-foreground mb-1">
                          {note.timestamp > 0 ? `At ${formatDuration(note.timestamp)}` : 'General note'}
                        </div>
                        {note.content}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'resources' && (
                <div>
                  {currentLesson.resources?.length > 0 ? (
                    <div className="space-y-2">
                      {currentLesson.resources.map((r, i) => (
                        <a key={i} href={r.url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted transition-colors text-sm">
                          <Download className="w-4 h-4 text-brand-600" />
                          <span className="flex-1">{r.name}</span>
                          <span className="text-xs text-muted-foreground">{r.type}</span>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No resources for this lesson.</p>
                  )}
                </div>
              )}
            </div>
          )}
        </main>

        {/* Sidebar - curriculum */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-l border-border bg-card overflow-hidden flex-shrink-0"
            >
              <div className="w-80 h-full flex flex-col">
                <div className="p-4 border-b border-border">
                  <h3 className="font-semibold text-sm">Course Content</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{completedCount}/{totalLessons} completed</p>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {course.sections?.map((section) => (
                    <div key={section._id} className="border-b border-border">
                      <button
                        onClick={() => setExpandedSections((prev) => ({ ...prev, [section._id]: !prev[section._id] }))}
                        className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors text-left"
                      >
                        <span className="text-sm font-medium line-clamp-2">{section.title}</span>
                        {expandedSections[section._id] ? <ChevronUp className="w-4 h-4 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 flex-shrink-0" />}
                      </button>
                      {expandedSections[section._id] && (
                        <div>
                          {section.lessons.map((lesson) => {
                            const isActive = currentLesson?._id === lesson._id;
                            const completed = isLessonCompleted(lesson._id);
                            return (
                              <button
                                key={lesson._id}
                                onClick={() => selectLesson(section, lesson)}
                                className={`w-full flex items-start gap-2.5 px-3 py-2.5 text-left transition-colors ${
                                  isActive ? 'bg-brand-50 dark:bg-brand-950/30 border-r-2 border-brand-600' : 'hover:bg-muted/50'
                                }`}
                              >
                                <div className="flex-shrink-0 mt-0.5">
                                  {completed ? (
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                  ) : isActive ? (
                                    <Play className="w-4 h-4 text-brand-600" />
                                  ) : (
                                    <Circle className="w-4 h-4 text-muted-foreground" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-xs leading-snug ${isActive ? 'text-brand-700 dark:text-brand-300 font-medium' : 'text-foreground'}`}>
                                    {lesson.title}
                                  </p>
                                  {lesson.duration > 0 && (
                                    <p className="text-xs text-muted-foreground mt-0.5">{formatDuration(lesson.duration)}</p>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
