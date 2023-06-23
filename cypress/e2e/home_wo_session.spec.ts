describe("The home page (logged out)", () => {
  it("should render the page", () => {
    cy.visit("/");
  });

  // render the page with a list of posts
  it("should render the page with a list of posts", () => {
    cy.visit("/");

    cy.get("li").should("have.length.greaterThan", 0);
  });

  // render the posts with a title, author, date, and comments count
  it("should render the posts with a title, author, date, and comments count", () => {
    cy.visit("/");

    cy.get("li")
      .first()
      .within(() => {
        cy.get(".postitem__title .postitem__title-link").should("exist");
        cy.get(".postitem__content .postitem__meta").should("exist");
        cy.get(".postitem__content .postitem__comment").should("exist");
      });
  });

  // User cannot vote if not logged in
  it("should not allow voting if not logged in", () => {
    cy.visit("/");

    cy.get("li")
      .first()
      .within(() => {
        cy.get(".postitem__vote-container").should("exist");
        cy.get(".postitem__vote-container button").should("be.disabled");
      });
  });

  // clicking on a post title should take the user to the post page
  it("should take the user to the post page when clicking on a post title", () => {
    cy.visit("/");

    // get url of first post and click title
    cy.get("li")
      .first()
      .within(() => {
        cy.get(".postitem__title .postitem__title-link").then(($el) => {
          const href = $el.attr("href");
          cy.get(".postitem__title .postitem__title-link").click();
          cy.url().should("include", href);
        });
      });
  });

  // clicking the new post button should take the user to the new post page but redirect to /auth/signin
  it("should take the user to the new post page but redirect to /auth/signin", () => {
    cy.visit("/");

    // find a with href="/posts/new" and click it
    cy.get("header a[href='/posts/new']").click();
    cy.url().should("include", "/auth/signin");
  });
});
