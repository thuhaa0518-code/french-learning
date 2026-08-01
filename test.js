const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  try {
    const attempt = await prisma.examAttempt.findFirst();
    if(!attempt) return console.log('no attempt');
    const questions = await prisma.question.findMany({ where: { examId: attempt.examId } });
    console.log('questions:', questions.length);
    await prisma.$transaction(async (tx) => {
      await tx.attemptAnswer.createMany({
        data: questions.map(q => ({
          attemptId: attempt.id,
          questionId: q.id,
          cauTraLoi: null,
          laDung: false,
          diemDatDuoc: 0
        }))
      })
    });
    console.log('Success')
  } catch(e) {
    console.error(e)
  } finally {
    await prisma.$disconnect()
  }
}
main();
