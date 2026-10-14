import { adminModel } from '../models/adminModel';

function parseDefaults(raw: unknown) {
  if (raw == null) return null;
  if (typeof raw === 'object') return raw;
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
  return null;
}

export const adminService = {
  async listTracks() {
    const rows = await adminModel.getAllTracks();
    return rows.map((row) => ({
      trackId: row.track_id,
      slug: row.slug,
      name: row.name,
      description: row.description,
      defaults: parseDefaults(row.defaults),
      isActive: Boolean(row.is_active),
    }));
  },
  async createTrack(body: any) {
    if (!body?.slug || !body?.name) throw Object.assign(new Error('slug and name required'), { status: 400 });
    const id = await adminModel.createTrack({
      slug: String(body.slug),
      name: String(body.name),
      description: body.description ?? null,
      defaults: body.defaults ?? { questionLimit: 10, secondsPerQuestion: 30 },
      isActive: body.isActive !== false,
    });
    return { trackId: id };
  },
  async updateTrack(trackId: number, body: any) {
    if (!body?.slug || !body?.name) throw Object.assign(new Error('slug and name required'), { status: 400 });
    const n = await adminModel.updateTrack(trackId, {
      slug: String(body.slug),
      name: String(body.name),
      description: body.description ?? null,
      defaults: body.defaults ?? null,
      isActive: body.isActive !== false,
    });
    if (!n) throw Object.assign(new Error('Track not found'), { status: 404 });
    return { updated: n };
  },
  async deleteTrack(trackId: number) {
    const n = await adminModel.deleteTrack(trackId);
    if (!n) throw Object.assign(new Error('Track not found'), { status: 404 });
    return { deleted: n };
  },
  async listCategories(trackId: number) {
    const rows = await adminModel.getCategoriesByTrackId(trackId);
    return rows.map((row) => ({
      categoryId: row.category_id,
      trackId: row.track_id,
      name: row.name,
      sortOrder: row.sort_order,
    }));
  },
  async createCategory(body: any) {
    if (!body?.trackId || !body?.name) {
      throw Object.assign(new Error('trackId and name required'), { status: 400 });
    }
    const id = await adminModel.createCategory(
      Number(body.trackId),
      String(body.name),
      Number(body.sortOrder ?? 0)
    );
    return { categoryId: id };
  },
  async updateCategory(categoryId: number, body: any) {
    if (!body?.trackId || !body?.name) {
      throw Object.assign(new Error('trackId and name required'), { status: 400 });
    }
    const n = await adminModel.updateCategory(categoryId, {
      trackId: Number(body.trackId),
      name: String(body.name),
      sortOrder: Number(body.sortOrder ?? 0),
    });
    if (!n) throw Object.assign(new Error('Category not found'), { status: 404 });
    return { updated: n };
  },
  async deleteCategory(categoryId: number) {
    const n = await adminModel.deleteCategory(categoryId);
    if (!n) throw Object.assign(new Error('Category not found'), { status: 404 });
    return { deleted: n };
  },
  async listQuestions(categoryId: number) {
    const questions = await adminModel.getQuestionsByCategory(categoryId);
    const ids = questions.map((q) => q.question_id);
    const choices = await adminModel.getChoicesByQuestionIds(ids);
    return questions.map((q) => ({
      questionId: q.question_id,
      categoryId: q.category_id,
      type: q.question_type,
      question: q.question_text,
      explanation: q.explanation,
      subjectiveAnswer: q.subjective_answer,
      choices: choices
        .filter((c) => c.question_id === q.question_id)
        .map((c) => ({
          choiceId: c.choice_id,
          choiceText: c.choice_text,
          isCorrect: Boolean(c.is_correct),
        })),
    }));
  },
  async createQuestion(body: any) {
    if (!body?.categoryId || !body?.questionType || !body?.questionText) {
      throw Object.assign(new Error('categoryId, questionType, questionText required'), {
        status: 400,
      });
    }
    const questionId = await adminModel.createQuestion({
      categoryId: Number(body.categoryId),
      questionType: String(body.questionType),
      questionText: String(body.questionText),
      explanation: body.explanation ?? null,
      subjectiveAnswer: body.subjectiveAnswer ?? null,
    });
    if (Array.isArray(body.choices) && body.choices.length > 0) {
      await adminModel.replaceChoices(
        questionId,
        body.choices.map((c: any, i: number) => ({
          choiceText: String(c.choiceText),
          isCorrect: Boolean(c.isCorrect),
          sortOrder: i,
        }))
      );
    }
    return { questionId };
  },
  async updateQuestion(questionId: number, body: any) {
    if (!body?.categoryId || !body?.questionType || !body?.questionText) {
      throw Object.assign(new Error('categoryId, questionType, questionText required'), {
        status: 400,
      });
    }
    const n = await adminModel.updateQuestion(questionId, {
      categoryId: Number(body.categoryId),
      questionType: String(body.questionType),
      questionText: String(body.questionText),
      explanation: body.explanation ?? null,
      subjectiveAnswer: body.subjectiveAnswer ?? null,
    });
    if (!n) throw Object.assign(new Error('Question not found'), { status: 404 });
    if (Array.isArray(body.choices)) {
      await adminModel.replaceChoices(
        questionId,
        body.choices.map((c: any, i: number) => ({
          choiceText: String(c.choiceText),
          isCorrect: Boolean(c.isCorrect),
          sortOrder: i,
        }))
      );
    }
    return { updated: n };
  },
  async deleteQuestion(questionId: number) {
    const n = await adminModel.deleteQuestion(questionId);
    if (!n) throw Object.assign(new Error('Question not found'), { status: 404 });
    return { deactivated: n };
  },
};
