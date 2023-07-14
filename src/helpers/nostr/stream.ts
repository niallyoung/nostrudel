import dayjs from "dayjs";
import { DraftNostrEvent, NostrEvent, isPTag } from "../../types/nostr-event";
import { unique } from "../array";

export const STREAM_KIND = 30311;
export const STREAM_CHAT_MESSAGE_KIND = 1311;

export type ParsedStream = {
  event: NostrEvent;
  author: string;
  host: string;
  title?: string;
  summary?: string;
  image?: string;
  updated: number;
  status: "live" | "ended" | string;
  starts?: number;
  ends?: number;
  identifier: string;
  tags: string[];
  streaming: string;
};

export function parseStreamEvent(stream: NostrEvent): ParsedStream {
  const title = stream.tags.find((t) => t[0] === "title")?.[1];
  const summary = stream.tags.find((t) => t[0] === "summary")?.[1];
  const image = stream.tags.find((t) => t[0] === "image")?.[1];
  const starts = stream.tags.find((t) => t[0] === "starts")?.[1];
  const endsTag = stream.tags.find((t) => t[0] === "ends")?.[1];
  const streaming = stream.tags.find((t) => t[0] === "streaming")?.[1];
  const identifier = stream.tags.find((t) => t[0] === "d")?.[1];

  const startTime = starts ? parseInt(starts) : stream.created_at;
  const endTime = endsTag ? parseInt(endsTag) : dayjs(startTime).add(4, "hour").unix();

  if (!identifier) throw new Error("missing identifier");
  if (!streaming) throw new Error("missing streaming");

  let status = stream.tags.find((t) => t[0] === "status")?.[1] || "ended";
  if (endTime > dayjs().unix()) {
    status = "ended";
  }

  // if the stream has not been updated in a day consider it ended
  if (stream.created_at < dayjs().subtract(2, "day").unix()) {
    status = "ended";
  }

  const host = stream.tags.filter(isPTag)[0]?.[1] ?? stream.pubkey;
  const tags = unique(stream.tags.filter((t) => t[0] === "t" && t[1]).map((t) => t[1] as string));

  return {
    author: stream.pubkey,
    host,
    event: stream,
    updated: stream.created_at,
    streaming,
    tags,
    title,
    summary,
    image,
    status,
    starts: startTime,
    ends: endTime,
    identifier,
  };
}

export function getATag(stream: ParsedStream) {
  return `${stream.event.kind}:${stream.author}:${stream.identifier}`;
}

export function buildChatMessage(stream: ParsedStream, content: string) {
  const template: DraftNostrEvent = {
    tags: [["a", getATag(stream), "", "root"]],
    content,
    created_at: dayjs().unix(),
    kind: STREAM_CHAT_MESSAGE_KIND,
  };

  return template;
}