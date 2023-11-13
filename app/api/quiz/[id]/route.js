import whichIndexesIncorrect from "@/lib/whichIndexesIncorrect";
import { server, unauthorized } from "@/lib/apiErrorResponses";
import stringCompare from "@/lib/stringCompare";
import { NextResponse } from "next/server";
import { Quiz } from "@/app/api/models";
import { cookies } from "next/headers";
import { useUser } from "@/lib/auth";

export async function POST(req, { params }) {
    try {
        const user = await useUser({ token: cookies().get("token")?.value });
        if (!user) return unauthorized;

        const { id } = params;
        const { userResponse } = await req.json();

        const quiz = await Quiz.findById(id);
        if (!quiz) {
            return NextResponse.json(
                {
                    message: `Quiz with id ${id} could not be found`,
                },
                { status: 404 },
            );
        }

        let isCorrect;
        let incorrectIndexes;

        if (["prompt-response", "multiple-choice"].includes(quiz.type)) {
            let incorrect = quiz.correctResponses.find(
                (x) => stringCompare(x, userResponse) >= 0.8,
            );
            isCorrect = incorrect !== undefined;
        }

        if (
            [
                "ordered-list-answer",
                "unordered-list-answer",
                "fill-in-the-blank",
                "verbatim",
            ].includes(quiz.type)
        ) {
            incorrectIndexes = whichIndexesIncorrect(
                userResponse,
                quiz.type === "fill-in-the-blank"
                    ? quiz.correctResponses.map((x) => x.split("_")[1])
                    : quiz.correctResponses,
                quiz.type !== "unordered-list-answer",
            );
            isCorrect = incorrectIndexes.length === 0;
        }

        let quizInUser = user.quizzes.find(
            (q) => q.quizId.toString() === quiz.id.toString(),
        );
        let canProgressLevel = false;
        if (!quizInUser) {
            console.log("new quiz question");
            canProgressLevel = true;
            quizInUser = {
                quizId: quiz.id,
                level: 0,
                hiddenUntil: new Date(),
            };
            user.quizzes.push(quizInUser);
        } else {
            console.log("old quiz question", quizInUser.hiddenUntil);
            canProgressLevel = Date.now() > quizInUser.hiddenUntil.getTime();
        }
        if (isCorrect && canProgressLevel) {
            let hiddenUntil = new Date();
            quizInUser.lastCorrect = new Date();
            quizInUser.level += 1;
            quizInUser.hiddenUntil = hiddenUntil.setDate(
                hiddenUntil.getDate() + quizInUser.level,
            );
        } else if (isCorrect) {
            quizInUser.lastCorrect = new Date();
        } else {
            quizInUser.lastCorrect = 0;
            quizInUser.level = quizInUser.level > 0 ? quizInUser.level - 1 : 0;
        }

        await user.save();

        return NextResponse.json({
            message: {
                isCorrect,
                incorrectIndexes,
                user,
                quiz: quizInUser,
            },
        });
    } catch (error) {
        console.error(`[Quiz] POST error:\n ${error}`);
        return server;
    }
}

export async function DELETE(req) {
    try {
        const user = await useUser({ token: cookies().get("token")?.value });

        if (!user) {
            return unauthorized;
        }

        const id = req.nextUrl.pathname.split("/")[3];

        const quiz = await Quiz.findById(id);
        if (!quiz) {
            return NextResponse.json(
                {
                    message: `The quiz ${id} could not be found to delete`,
                },
                { status: 404 },
            );
        }

        if (quiz.createdBy.toString() !== user.id.toString()) {
            return NextResponse.json(
                {
                    message: `User ${user.id} is not authorized to delete quiz ${id}. Only the creator ${quiz.createdBy} is permitted`,
                },
                { status: 403 },
            );
        }

        const deletion = await Quiz.deleteOne({ id });
        if (deletion.deletedCount === 0) {
            console.error(`Unable to delete quiz ${id}\nError: ${error}`);
            return NextResponse.json(
                {
                    message: `Unable to delete quiz ${id}`,
                },
                { status: 500 },
            );
        }
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error(`[Quiz] DELETE error:\n ${error}`);
        return server;
    }
}
