import ManageBookingClient from "./ManageBookingClient";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ManageBookingPage({ params }: PageProps) {
  const { id } = await params;
  return <ManageBookingClient id={id} />;
}
