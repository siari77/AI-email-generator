import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './api/auth/[...nextauth]';
import prisma from '../lib/prisma';

export default function EmailHistory({ emails }: any) {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Email History</h1>
      {emails.length === 0 && <p>No emails generated yet.</p>}
      <ul>
        {emails.map((email: any) => (
          <li key={email.id} style={{ marginBottom: '1rem', border: '1px solid #ccc', padding: '1rem' }}>
            <p>{email.content}</p>
            <small>Created at: {new Date(email.createdAt).toLocaleString()}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session || !session.user?.email) {
    return {
      redirect: {
        destination: '/api/auth/signin',
        permanent: false,
      },
    };
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  const emails = await prisma.email.findMany({
    where: { userId: user?.id },
    orderBy: { createdAt: 'desc' },
  });

  return {
    props: {
      emails,
    },
  };
};
