import { Platform } from "../interfaces/IPlatform";

const state = encodeURIComponent(
    JSON.stringify({ communityId: localStorage.getItem("activeCommunityId") })
);
export const initialPlatforms: Array<Platform> = [
    {
        key: "discord",
        name: "Discord",
        url: "https://discord.com",
        urlAuth: `https://discord.com/oauth2/authorize?client_id=${process.env.NEXT_PUBLIC_DSD_CLIENT_ID}&permissions=378225683536&response_type=code&redirect_uri=${process.env.NEXT_PUBLIC_BACKEND_URL}/discord/link&integration_type=0&scope=bot+applications.commands+identify+guilds+email&state=${state}`,
        color: "#5865F2",
        options: [{ label: "", value: "" }],
        estimatedVolume: 1240,
        lastFetched: {
            date: new Date(),
            channels: [
            {
                name: "",
                qty: 0,
            },
            ],
        },
        type: "channels",
        account: {
            id: "",
            name: "",
            connected: false,
        },
        cat: "chat",
    },
    {
        key: "whatsapp",
        name: "WhatsApp",
        url: "https://whatsapp.com",
        urlAuth: ``,
        color: "#5865F2",
        options: [{ label: "", value: "" }],
        estimatedVolume: 1240,
        lastFetched: {
            date: new Date(),
            channels: [
            {
                name: "",
                qty: 0,
            },
            ],
        },
        type: "channels",
        account: {
            id: "",
            name: "",
            connected: false,
        },
        cat: "chat",
    },
        {
        key: "telegram",
        name: "Telegram",
        url: "https://web.telegram.org/",
        urlAuth: ``,
        color: "#5865F2",
        options: [{ label: "", value: "" }],
        estimatedVolume: 1240,
        lastFetched: {
            date: new Date(),
            channels: [
            {
                name: "",
                qty: 0,
            },
            ],
        },
        type: "channels",
        account: {
            id: "",
            name: "",
            connected: false,
        },
        cat: "chat",
    },
    {
        key: "slack",
        name: "Slack",
        url: "https://slack.com",
        urlAuth: ``,
        color: "#5865F2",
        options: [{ label: "", value: "" }],
        estimatedVolume: 1240,
        lastFetched: {
            date: new Date(),
            channels: [
            {
                name: "",
                qty: 0,
            },
            ],
        },
        type: "channels",
        account: {
            id: "",
            name: "",
            connected: false,
        },
        cat: "chat",
    },
    {
      key: "youtube",
      name: "YouTube",
      url: "https://youtube.com",
      urlAuth: "",
      color: "#FF0000",
      options: [],
      estimatedVolume: 3,
      lastFetched: {
        date: new Date(),
        channels: [
          {
            name: "",
            qty: 0,
          },
        ],
      },
      type: "videos",
      account: {
        id: "",
        name: "",
        connected: false,
      },
      cat: "social-network",
    },
    {
      key: "x",
      name: "X",
      url: "https://x.com",
      urlAuth: "",
      color: "#000000",
      options: [
        { label: "Post 1", value: "post1" },
        { label: "Post 2", value: "post2" },
        { label: "Post 3", value: "post3" },
      ],
      estimatedVolume: 12,
      lastFetched: {
        date: new Date(),
        channels: [
          {
            name: "",
            qty: 0,
          },
        ],
      },
      type: "posts",
      account: {
        id: "",
        name: "",
        connected: false,
      },
      cat: "social-network",
    },
    {
      key: "instagram",
      name: "Instagram",
      url: "https://instagram.com",
      urlAuth: "",
      color: "#000000",
      options: [
        { label: "Post 1", value: "post1" },
        { label: "Post 2", value: "post2" },
        { label: "Post 3", value: "post3" },
      ],
      estimatedVolume: 12,
      lastFetched: {
        date: new Date(),
        channels: [
          {
            name: "",
            qty: 0,
          },
        ],
      },
      type: "posts",
      account: {
        id: "",
        name: "",
        connected: false,
      },
      cat: "social-network",
    },
    
  ];