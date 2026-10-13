import { QUIZ_SETTINGS } from "../models/constants";
import { quizModel } from "../models/quizModel";
import { trackModel } from "../models/trackModel";

function formatQuizzes(
    questions: Awaited<ReturnType<typeof quizModel.getQuestionsByCategoryIds>>,
    choices: Awaited<ReturnType<typeof quizModel.getChoicesByQuestionsIds>>
) {
    return questions.map((question) => {
        const relatedChoices = choices.filter(
            (choice) => choice.question_id === question.question_id
        );

        return {
            questionId: question.question_id,
            categoryId: question.category_id,
            categoryName: question.category_name,
            type: question.question_type,
            question: question.question_text,
            explanation: question.explanation,
            subjectiveAnswer: question.subjective_answer,
            choices: relatedChoices.map((choice) => ({
                choiceId: choice.choice_id,
                choiceText: choice.choice_text,
                isCorrect: Boolean(choice.is_correct),
            })),
        };
    });
}

export const quizService = {
    async getCategories(trackSlug?: string) {
        if (trackSlug) {
            const track = await trackModel.getTrackBySlug(trackSlug);
            if (!track) return null;
            const rows = await quizModel.getCategoriesByTrackId(track.track_id);
            return rows.map((row) => ({
                categoryId: row.category_id,
                trackId: row.track_id,
                name: row.name,
            }));
        }

        const rows = await quizModel.getCategories();
        return rows.map((row) => ({
            categoryId: row.category_id,
            trackId: row.track_id,
            name: row.name,
        }));
    },
    async getQuizzesByCategoryIds(
        categoryId: number[],
        quizLimit: number = QUIZ_SETTINGS.DEFAULT_QUESTION_COUNT,
        trackSlug?: string
    ) {
        if (!categoryId || categoryId.length === 0) {
            return [];
        }

        let questions;
        if (trackSlug) {
            const track = await trackModel.getTrackBySlug(trackSlug);
            if (!track) return null;
            questions = await quizModel.getQuestionsByTrackAndCategoryIds(
                track.track_id,
                categoryId,
                quizLimit
            );
        } else {
            questions = await quizModel.getQuestionsByCategoryIds(categoryId, quizLimit);
        }

        if (questions.length === 0) {
            return [];
        }

        const questionIds = questions.map((question) => question.question_id);
        const choices = await quizModel.getChoicesByQuestionsIds(questionIds);
        return formatQuizzes(questions, choices);
    },
    async getQuizzesByIds(questionIds: number[], trackSlug?: string) {
        const uniqueIds = [...new Set(questionIds.filter((id) => !Number.isNaN(id)))];
        if (uniqueIds.length === 0) {
            return [];
        }

        let trackId: number | undefined;
        if (trackSlug) {
            const track = await trackModel.getTrackBySlug(trackSlug);
            if (!track) return null;
            trackId = track.track_id;
        }

        const questions = await quizModel.getQuestionsByIds(uniqueIds);
        const filtered = trackId == null
            ? questions
            : questions.filter((q) => q.track_id === trackId);

        const order = new Map(uniqueIds.map((id, index) => [id, index]));
        filtered.sort(
            (a, b) => (order.get(a.question_id) ?? 0) - (order.get(b.question_id) ?? 0)
        );

        if (filtered.length === 0) {
            return [];
        }

        const ids = filtered.map((q) => q.question_id);
        const choices = await quizModel.getChoicesByQuestionsIds(ids);
        return formatQuizzes(filtered, choices);
    },
};
