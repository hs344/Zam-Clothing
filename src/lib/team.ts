// The four people behind ZAM, shown in the About Us photo frames on the home page.
// Edit the names/roles and drop photos into public/images/team/, then set `image`
// (e.g. "/images/team/aarav.jpg"). Leave `image` empty to show a monogram frame.

export interface TeamMember {
  name: string;
  role: string;
  image: string;
}

export const TEAM: TeamMember[] = [
  { name: "Founder One", role: "Co-founder · Design", image: "" },
  { name: "Founder Two", role: "Co-founder · Sourcing", image: "" },
  { name: "Founder Three", role: "Co-founder · Operations", image: "" },
  { name: "Founder Four", role: "Co-founder · Community", image: "" },
];

export const ABOUT = {
  eyebrow: "About Us",
  title: "Young-made, literally.",
  body: [
    "ZAM was started by four friends who wanted clothes that felt good, looked right and didn't punish the wallet. So we made them ourselves.",
    "Everything we sell, we wear. We keep the range small, the fabrics honest and the prices fair — and we talk to every customer on WhatsApp, personally.",
  ],
};
