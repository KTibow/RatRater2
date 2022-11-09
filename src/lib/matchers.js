const flags = [
  {
    match: /https?:\/\/checkip\.amazonaws\.com/i,
    desc: "Tries to get your IP address",
    importance: {
      score: 1,
      desc: "Could be used as a joke, but rats commonly get your IP address",
    },
    type: "interaction",
    present: ["dreamys"],
  },
  {
    match: "File not found :(",
    desc: "Known part of the Dreamys rat",
    importance: {
      score: 3,
      desc: "Could be another developer just happens to use it, but it's a known string",
    },
    type: "signature",
    present: ["dreamys"],
  },
];
