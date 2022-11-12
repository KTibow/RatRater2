export const flags = [
  {
    match: /localhost:(?:443|80)/i,
    desc: "References the local server",
    importance: {
      score: 1,
      desc:
        "The person who made this forgot to change the reference" +
        " to their own computer to a separate computer. This could mean" +
        " the person who made this is a dumb ratter, or something else.",
    },
    type: "exfil",
  },
  {
    match: /[a-z0-9-]{1,30}\.herokuapp\.com/i,
    desc: "References a Heroku server",
    importance: {
      score: 2,
      desc:
        "Heroku is a company where you can host websites. It's" +
        " commonly used in rats, but it might be used for another functionality.",
    },
    type: "exfil",
  },
  {
    match: /https?:\/\/discord\.com\/api\/webhooks/i,
    desc: "References a Discord webhook",
    importance: {
      score: 2,
      desc:
        "Discord webhooks are commonly used to exfiltrate data." +
        " However they might have other uses, like notifications.",
    },
    type: "exfil",
  },
  {
    match: /media.guilded.gg/i,
    desc: "References a Guilded webhook",
    importance: {
      score: 2,
      desc: "Guilded webhooks are sometimes used to exfiltrate data.",
    },
    type: "exfil",
  },
  {
    match: /https?:\/\/api.breadcat.cc/i,
    desc: "References Breadcat's server",
    importance: {
      score: 3,
      desc: "Breadcat's server is a service used to exfiltrate data to Discord.",
    },
    type: "exfil",
  },
  {
    match: /https?:\/\/checkip\.amazonaws\.com/i,
    desc: "Tries to get your IP address",
    importance: {
      score: 1,
      desc: "Could be used as a joke, but rats commonly get your IP address",
    },
    type: "getData",
    present: ["dreamys"],
  },
  {
    match: /File not found :\(/i,
    desc: "Known part of the Dreamys rat",
    importance: {
      score: 3,
      desc: "Could be another developer just happens to use it, but it's a known string.",
    },
    type: "signature",
    present: ["dreamys"],
  },
];
