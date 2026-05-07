const Quiz = require('../models/Quiz');
const Progress = require('../models/Progress');
const Course = require('../models/Course');
const User = require('../models/User');
const { AppError } = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Create quiz
// @route   POST /api/quizzes
// @access  Private (Instructor)
exports.createQuiz = asyncHandler(async (req, res, next) => {
  req.body.instructor = req.user.id;
  const quiz = await Quiz.create(req.body);
  res.status(201).json({ success: true, quiz });
});

// @desc    Get quiz by ID
// @route   GET /api/quizzes/:id
// @access  Private
exports.getQuiz = asyncHandler(async (req, res, next) => {
  const quiz = await Quiz.findById(req.params.id);
  if (!quiz) return next(new AppError('Quiz not found', 404));

  // Check enrollment
  const user = await User.findById(req.user.id);
  const isEnrolled = user.enrolledCourses.some(
    (e) => e.course.toString() === quiz.course.toString()
  );

  if (!isEnrolled && req.user.role !== 'admin' && quiz.instructor.toString() !== req.user.id) {
    return next(new AppError('Not enrolled in this course', 403));
  }

  // Check attempt limit
  const progress = await Progress.findOne({ user: req.user.id, course: quiz.course });
  const attempts = progress
    ? progress.quizAttempts.filter((a) => a.quiz.toString() === quiz._id.toString())
    : [];

  if (quiz.maxAttempts > 0 && attempts.length >= quiz.maxAttempts) {
    return next(new AppError(`Maximum attempts (${quiz.maxAttempts}) reached`, 400));
  }

  // Shuffle questions if enabled
  let questions = [...quiz.questions];
  if (quiz.shuffleQuestions) {
    questions = questions.sort(() => Math.random() - 0.5);
  }

  // Shuffle options if enabled
  if (quiz.shuffleOptions) {
    questions = questions.map((q) => ({
      ...q.toObject(),
      options: q.options.sort(() => Math.random() - 0.5),
    }));
  }

  // Don't send correct answers to client
  const sanitizedQuestions = questions.map((q) => ({
    _id: q._id,
    question: q.question,
    type: q.type,
    options: q.options.map((o) => ({ _id: o._id, text: o.text })),
    points: q.points,
    order: q.order,
  }));

  res.status(200).json({
    success: true,
    quiz: {
      _id: quiz._id,
      title: quiz.title,
      description: quiz.description,
      timeLimit: quiz.timeLimit,
      passingScore: quiz.passingScore,
      questions: sanitizedQuestions,
      totalQuestions: questions.length,
      attemptsUsed: attempts.length,
      maxAttempts: quiz.maxAttempts,
    },
  });
});

// @desc    Submit quiz
// @route   POST /api/quizzes/:id/submit
// @access  Private
exports.submitQuiz = asyncHandler(async (req, res, next) => {
  const quiz = await Quiz.findById(req.params.id);
  if (!quiz) return next(new AppError('Quiz not found', 404));

  const { answers, timeTaken } = req.body;

  // Grade the quiz
  let earnedPoints = 0;
  let totalPoints = 0;
  const gradedAnswers = [];

  quiz.questions.forEach((question) => {
    totalPoints += question.points;
    const userAnswer = answers.find((a) => a.questionId === question._id.toString());

    if (userAnswer) {
      let isCorrect = false;

      if (question.type === 'multiple-choice' || question.type === 'true-false') {
        const correctOption = question.options.find((o) => o.isCorrect);
        isCorrect = correctOption && userAnswer.selectedOptionId === correctOption._id.toString();
      } else if (question.type === 'short-answer') {
        isCorrect = userAnswer.answer?.toLowerCase().trim() === question.correctAnswer?.toLowerCase().trim();
      }

      if (isCorrect) earnedPoints += question.points;

      gradedAnswers.push({
        question: question._id,
        selectedOption: userAnswer.selectedOptionId,
        isCorrect,
      });
    }
  });

  const percentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
  const passed = percentage >= quiz.passingScore;

  // Save attempt to progress
  let progress = await Progress.findOne({ user: req.user.id, course: quiz.course });
  if (!progress) return next(new AppError('Not enrolled in this course', 403));

  const attemptNumber = progress.quizAttempts.filter(
    (a) => a.quiz.toString() === quiz._id.toString()
  ).length + 1;

  progress.quizAttempts.push({
    quiz: quiz._id,
    score: earnedPoints,
    totalPoints,
    percentage,
    passed,
    answers: gradedAnswers,
    attemptNumber,
    startedAt: req.body.startedAt || new Date(Date.now() - (timeTaken || 0) * 1000),
    completedAt: new Date(),
    timeTaken,
  });

  await progress.save();

  // Award points for passing
  if (passed) {
    await User.findByIdAndUpdate(req.user.id, { $inc: { points: 25 } });
  }

  // Build result with explanations
  const result = {
    score: earnedPoints,
    totalPoints,
    percentage,
    passed,
    passingScore: quiz.passingScore,
    attemptNumber,
  };

  if (quiz.showResults) {
    result.answers = quiz.showCorrectAnswers
      ? quiz.questions.map((q) => {
          const userAns = gradedAnswers.find((a) => a.question.toString() === q._id.toString());
          return {
            question: q.question,
            explanation: q.explanation,
            correctOption: q.options.find((o) => o.isCorrect),
            userAnswer: userAns,
            isCorrect: userAns?.isCorrect,
          };
        })
      : gradedAnswers;
  }

  res.status(200).json({ success: true, result });
});

// @desc    Update quiz
// @route   PUT /api/quizzes/:id
// @access  Private (Instructor)
exports.updateQuiz = asyncHandler(async (req, res, next) => {
  const quiz = await Quiz.findById(req.params.id);
  if (!quiz) return next(new AppError('Quiz not found', 404));

  if (quiz.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Not authorized', 403));
  }

  const updatedQuiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, quiz: updatedQuiz });
});

// @desc    Delete quiz
// @route   DELETE /api/quizzes/:id
// @access  Private (Instructor)
exports.deleteQuiz = asyncHandler(async (req, res, next) => {
  const quiz = await Quiz.findById(req.params.id);
  if (!quiz) return next(new AppError('Quiz not found', 404));

  if (quiz.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Not authorized', 403));
  }

  await quiz.deleteOne();
  res.status(200).json({ success: true, message: 'Quiz deleted' });
});

// @desc    Get quiz results for instructor
// @route   GET /api/quizzes/:id/results
// @access  Private (Instructor)
exports.getQuizResults = asyncHandler(async (req, res, next) => {
  const quiz = await Quiz.findById(req.params.id);
  if (!quiz) return next(new AppError('Quiz not found', 404));

  if (quiz.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Not authorized', 403));
  }

  const progressRecords = await Progress.find({
    course: quiz.course,
    'quizAttempts.quiz': quiz._id,
  }).populate('user', 'name email avatar');

  const results = progressRecords.map((p) => {
    const attempts = p.quizAttempts.filter((a) => a.quiz.toString() === quiz._id.toString());
    const bestAttempt = attempts.reduce((best, curr) =>
      curr.percentage > (best?.percentage || 0) ? curr : best, null
    );
    return {
      user: p.user,
      attempts: attempts.length,
      bestScore: bestAttempt?.percentage || 0,
      passed: bestAttempt?.passed || false,
      lastAttempt: attempts[attempts.length - 1]?.completedAt,
    };
  });

  res.status(200).json({ success: true, results });
});
