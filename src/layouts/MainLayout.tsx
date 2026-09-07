import Head from "next/head";
import { Header } from "~/components/Header";
import { Footer } from "~/components/Footer";
import { QuoteBar } from "~/components/QuoteBar";

type MainLayoutProps = {
  pageTitle: string;
  description: string;
  children: React.ReactNode;
};

export const MainLayout: React.FC<MainLayoutProps> = ({
  pageTitle,
  description,
  children,
}) => {
  const title = pageTitle ? `${pageTitle} | TechStories` : "TechStories";
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description || ""} />
        <link rel="icon" href="/favicon-32x32.png" />
      </Head>
      <div className="mx-auto flex min-h-screen w-full flex-col">
        <QuoteBar />
        <div className="mx-auto flex w-full max-w-7xl flex-col px-4 sm:px-6 lg:px-8">
          <Header />
          <main className="mb-5 w-full">{children}</main>
          <Footer />
        </div>
      </div>
    </>
  );
};

export default MainLayout;
