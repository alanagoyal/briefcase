import SubscriptionSuccessClient from '@/components/subscription-success'

export default function SubscriptionSuccessPage({ searchParams }: { searchParams: { session_id: string } }) {
  const { session_id } = searchParams;
  return <SubscriptionSuccessClient session_id={session_id} />
}