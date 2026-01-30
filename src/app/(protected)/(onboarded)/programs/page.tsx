import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getPrograms, startProgram } from '@/lib/actions/programs';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import t from '@/lib/i18n/t';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ProgramsPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    redirect('/login');
  }
  const programs = await getPrograms();
  const userId = session.user.id as string;

  async function handleEnroll(formData: FormData) {
    'use server';
    const programId = formData.get('programId') as string;

    await startProgram(programId);
    redirect('/dashboard');
  }

  const difficultyColors: Record<string, string> = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800',
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">{t('programs.title')}</h1>
        <p className="text-gray-600">{t('programs.subtitle')}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {programs.map((program: any) => (
          <Card key={program.id} className="flex flex-col">
            <div className="flex-1">
              <div className="mb-3">
                <span
                  className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                    difficultyColors[program.difficulty]
                  }`}
                >
                  {program.difficulty === 'beginner'
                    ? t('programs.badge.beginner')
                    : program.difficulty === 'intermediate'
                    ? t('programs.badge.intermediate')
                    : t('programs.badge.advanced')}
                </span>
              </div>
              <h3 className="text-xl font-bold mb-2">{program.name}</h3>
              <p className="text-sm text-gray-600 mb-3">{program.tagline}</p>
              <p className="text-sm text-gray-700 mb-4">
                {program.description}
              </p>
              <p className="text-sm font-medium text-gray-900">
                {program.durationDays} {t('programs.days')}
              </p>
            </div>
            <form action={handleEnroll} className="mt-4">
              <input type="hidden" name="programId" value={program.id} />
              <Button type="submit" className="w-full">
                {t('programs.button_start')}
              </Button>
            </form>
          </Card>
        ))}
      </div>
    </div>
  );
}
