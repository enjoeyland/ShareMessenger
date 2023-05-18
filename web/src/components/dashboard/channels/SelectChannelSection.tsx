import {
  HashtagIcon,
  SearchIcon,
} from "@heroicons/react/outline";
import Spinner from "components/Spinner";
import { ChannelsContext } from "contexts/ChannelsContext";
import { useWorkspaceById } from "hooks/useWorkspaces";
import { useContext, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { useTheme } from "contexts/ThemeContext";

const ChannelItemDiv = styled.div`
  :hover {
    background-color: ${(props) => props.theme.selectionBackground};
  }
`;

function ChannelItem({ onClick, channel }: 
  { onClick: any; channel: any; }) {
  const { channelId, workspaceId } = useParams();
  const { value: workspace } = useWorkspaceById(workspaceId);
  const { themeColors } = useTheme();

  const isCurrent = channelId === channel.objectId;
  return (
    <li className="px-8 py-2 flex justify-between items-center cursor-pointer group">
      <ChannelItemDiv
        className="flex items-center group-hover:w-4/6 w-full"
        onClick={onClick}
        theme={themeColors}
      >
        <div
          className="rounded p-2 mr-4"
          style={{ backgroundColor: "#f4ede4" }}
        >
          <HashtagIcon className="h-6 w-6" style={{ color: "#4a154b" }} />
        </div>
        <span className="font-bold th-color-for truncate">
          {channel?.name.replace("#", "")}
          {isCurrent && (
            <span className="font-normal opacity-70 ml-1 th-color-for">
              (current)
            </span>
          )}
          {channel?.isArchived && (
            <span className="text-sm opacity-70"> (archived)</span>
          )}
          {workspace?.channelId === channel?.objectId && (
            <span className="text-sm opacity-70"> (default)</span>
          )}
        </span>
      </ChannelItemDiv>
    </li>
  );
}

export default function SelectChannelSection({
    filter,
    onClick
  }: {
    filter: any
    onClick: any
  }) {
  const { value: channels, loading } = useContext(ChannelsContext);
  const [search, setSearch] = useState("");

  const displayChannels = useMemo(
    () =>
      channels
        .filter((ch: any) => {
          return filter(ch)
        })
        .reduce((result: any, ch: any) => {
        if (
          ch.name
            .replace("#", "")
            .toLowerCase()
            .includes(search.toLowerCase())
        )
          result.push(ch);
        return result;
      }, []),
    [channels, search]
  );

  return (
    <>
      <div className="px-8 w-full">
        <div className="flex items-center border w-full shadow-sm rounded px-2 th-color-for th-bg-bg th-border-selbg">
          <SearchIcon className="h-5 w-5 th-color-for" />
          <input
            type="text"
            name="findMembers"
            id="findMembers"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Find channels"
            className="block text-base border-0 w-full focus:outline-none focus:ring-0 th-bg-bg"
          />
        </div>
      </div>
      {loading && !channels ? (
        <div className="flex items-center justify-center px-5">
          <Spinner className="h-6 w-6 th-color-for" />
        </div>
      ) : (
        <ul
          className="w-full mt-6 overflow-y-scroll"
          style={{ height: "400px" }}
        >
          {displayChannels?.map((channel: any) => (
            <ChannelItem onClick={()=>onClick(channel)} channel={channel} key={channel?.objectId} />
          ))}
        </ul>
      )}
    </>
  );
}
