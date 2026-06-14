export function buildOutreachEmail(restaurant) {
  const { name, audit, area } = restaurant;

  const subject = audit?.pitchAngle
    ? audit.pitchAngle
    : `A rebrand idea for ${name}`;

  const body = buildEmailBody(restaurant);

  // mailto: URL - opens their default mail client with everything pre-filled
  const mailto = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return { subject, body, mailto };
}

function buildEmailBody(restaurant) {
  const { name, cuisine, area, audit } = restaurant;

  return `Hi there,

I came across ${name} while researching ${cuisine.toLowerCase()} spots in ${area}, and I had some thoughts on how a brand refresh could really elevate how you're perceived — especially online.

${audit?.pitchAngle ? audit.pitchAngle + '.' : ''}

I've put together a short brand audit and some visual direction that I think you'd find interesting. The attached PDF covers:

  • A current brand assessment — what's working and what's holding you back
  • A rebrand direction — specific typography, color palette, and menu layout recommendations tailored to ${name}
  • A proposal — what we'd build together and how it works

This kind of work is exactly what I do — brand identity and menu design for restaurants that deserve a visual presence that matches their food.

Would you be open to a quick 20-minute call to talk it through?

Best,
[Your name]

--
Portfolio: [your website]
`.trim();
}
