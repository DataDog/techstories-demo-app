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
      <div className="mx-auto flex min-h-screen flex-col">
        <QuoteBar />
        <div className="mx-auto flex w-full max-w-4xl flex-col">
          <Header />
          <main className="mb-5">{children}</main>
          <Footer />
        </div>
      </div>
    </>
  );
};

export default MainLayout;
