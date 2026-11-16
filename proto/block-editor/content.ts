import { createBlock } from "../../src/blocks/model";

// Worst-case content: a two-line title, an unbroken URL, a long paragraph, code, an empty block, many rows.
function worstCase() {
  const done = createBlock("todo", "Confirm the venue holds two hundred and forty people");
  done.checked = true;
  return [
    createBlock(
      "h1",
      "Quarterly planning notes for the Northern Europe and Asia-Pacific regional teams",
    ),
    createBlock(
      "text",
      "Everything here is a draft. The agenda moved twice since Monday, so check the dates before you forward this page to anyone outside the planning group.",
    ),
    createBlock("h2", "Before the offsite"),
    done,
    createBlock(
      "todo",
      "Send the travel form: https://example.com/forms/travel-reimbursement/2026/q4/northern-europe-and-asia-pacific?ref=planning-notes",
    ),
    createBlock("todo", "Book rooms"),
    createBlock("todo", ""),
    createBlock(
      "quote",
      "If the room is too small we split the group, and nobody likes the second room.",
    ),
    createBlock("divider"),
    createBlock("h2", "Agenda"),
    createBlock("text", "Day one is reviews. Day two is planning. Day three is open."),
    createBlock(
      "code",
      "09:00  Arrivals\n09:30  Regional reviews (4 x 25 min)\n12:00  Lunch\n13:15  Planning, round one",
    ),
    createBlock("text", "Reviews run long every time. Keep the buffer."),
    createBlock("h2", "Open questions"),
    createBlock("todo", "Who owns the budget line for interpreters?"),
    createBlock("todo", "Do remote attendees join the workshops or only the reviews?"),
    createBlock("text", "Add yours below."),
    createBlock("text", ""),
  ];
}

export { worstCase };
