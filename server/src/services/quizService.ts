import { isContext } from "vm";
import { getQuizzes } from "../controllers/quizController";
import { quizModel } from "../models/quizModel";

export const quizService = {
    getQuizzes: async() => {
        const questions = await quizModel.getAllQuestions();
        const choices = await quizModel.getAllChoices();

        if(questions.length === 0){
            return [];
        }

        const formattedData = questions.map((question) => {
            const relatedChoices = choices.filter((choice) => choice.question_id === question.id);

            return {
                id: question.id,
                category: question.category,
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