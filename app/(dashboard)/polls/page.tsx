import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getUserPolls } from '@/app/lib/actions/poll-actions';
import PollActions from './PollActions';
import { ErrorDisplay } from '@/app/components/ui/error-display';

/**
 * Server-rendered page that fetches and displays the current user's polls.
 *
 * Renders a header with a "Create New Poll" action, then fetches polls via
 * getUserPolls(). If an error is returned it is shown using ErrorDisplay.
 * When polls are present each poll is rendered with PollActions; when no polls
 * exist a centered empty-state panel with a create button is shown.
 *
 * @returns A server-rendered React element for the user's polls page.
 */
export default async function PollsPage() {
  const { polls, error } = await getUserPolls();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">My Polls</h1>
        <Button asChild>
          <Link href="/create">Create New Poll</Link>
        </Button>
      </div>
      
      {error && <ErrorDisplay error={error} />}
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {polls && polls.length > 0 ? (
          polls.map((poll) => <PollActions key={poll.id} poll={poll} />)
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center col-span-full">
            <h2 className="text-xl font-semibold mb-2">No polls yet</h2>
            <p className="text-slate-500 mb-6">Create your first poll to get started</p>
            <Button asChild>
              <Link href="/create">Create New Poll</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}