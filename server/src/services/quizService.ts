import { QUIZ_SETTINGS } from "../models/constants";
import { quizModel } from "../models/quizModel";

export const quizService = {
    async getCategories() {
        const categoryRow = await quizModel.getCategories();
        return categoryRow;
    },
    async getQuizzesByCategoryIds(
        categoryId: number[], 
        quizLimit: number = QUIZ_SETTINGS.DEFAULT_QUESTION_COUNT
    ) {
        if (!categoryId || categoryId.length === 0) {
            return [];
        }

        const questions = await quizModel.getQuestionsByCategoryIds(categoryId, quizLimit);

        if (questions.length === 0) {
            return [];
        }

        const questionIds = questions.map(q => q.id);

        const choices = await quizModel.getChoicesByQuestionsIds(questionIds);

        const formattedData = questions.map((question) => {
            const relatedChoices = choices.filter((choice) => choice.question_id === question.id);

            return {
                id: question.id,
                categoryId: question.category_id,
                categoryName: question.category_name,
                type: question.question_type,
                question: question.question_text,
                explanation: question.explanation,
                subjectiveAnswer: question.subjective_answer,
                choices: relatedChoices.map((choice) => ({
                    id: choice.id,
                    text: choice.choice_text,
                    isCorrect: Boolean(choice.is_correct),
                }))
            };
        });

        return formattedData;
    }
};
