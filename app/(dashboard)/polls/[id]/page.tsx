import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { getPollResults } from '@/app/lib/actions/poll-actions';
import { notFound } from 'next/navigation';
import PollVotingForm from './PollVotingForm';
import { getCurrentUser } from '@/app/lib/actions/auth-actions';
import PollDeleteButton from './PollDeleteButton';

export default async function PollDetailPage({ params }: { params: { id: string } }) {
  const { poll, results, userVote, error } = await getPollResults(params.id);
  const user = await getCurrentUser();

  if (error || !poll || !results) {
    notFound();
  }

  const totalVotes = results.reduce((sum, result) => sum + result.count, 0);
  const userHasVoted = userVote !== null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/polls" className="text-blue-600 hover:underline">
          &larr; Back to Polls
        </Link>
        {user && user.id === poll.user_id && (
          <div className="flex space-x-2">
            <Button variant="outline" asChild>
              <Link href={`/polls/${params.id}/edit`}>Edit Poll</Link>
            </Button>
            <PollDeleteButton pollId={poll.id} />
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{poll.question}</CardTitle>
          {!userHasVoted && <CardDescription>Cast your vote below</CardDescription>}
          {userHasVoted && <CardDescription>You have already voted on this poll.</CardDescription>}
        </CardHeader>
        <CardContent className="space-y-4">
          {!userHasVoted ? (
            <PollVotingForm poll={poll} />
          ) : (
            <div className="space-y-3">
              {results.map((result, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between items-baseline">
                    <span className={`font-medium ${userVote === index ? 'text-blue-600' : ''}`}>
                      {result.option}
                    </span>
                    <span className="text-sm text-slate-500">
                      {result.count} votes ({result.percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${result.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="text-sm text-slate-500 flex justify-between">
          <span>Total Votes: {totalVotes}</span>
          <span>Created on {new Date(poll.created_at).toLocaleDateString()}</span>
        </CardFooter>
      </Card>

      <div className="pt-4">
        <h2 className="text-xl font-semibold mb-4">Share this poll</h2>
        <div className="flex space-x-2">
          <Button variant="outline" className="flex-1">
            Copy Link
          </Button>
          <Button variant="outline" className="flex-1">
            Share on Twitter
          </Button>
        </div>
      </div>
    </div>
  );
}