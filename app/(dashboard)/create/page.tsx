import PollCreateForm from "./PollCreateForm";

export default function CreatePollPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Create a New Poll</h1>
        <p className="text-slate-600 mt-2">Ask a question and let people vote on their favorite option</p>
      </div>
      <PollCreateForm />
    </div>
  );
}