import json
import requests
from typing import List

GQL_SERVER = 'http://localhost:4000'
API_URL = 'http://localhost:4001'


class User:
    import private

    def __init__(self, email=private.EMAIL, password=private.PASSWORD) -> None:
        r = requests.post(f'{GQL_SERVER}/auth/login',
                          json={"email": email,
                                "password": password},
                          verify=False)

        if __debug__:
            print(r.text)
        self._data = json.loads(r.text)

    def getUserId(self) -> str:
        return self._data["uid"]

    def getAuthorizationHeader(self) -> str:
        return {"authorization": f"Bearer {self._data['idToken']}"}


authorization_header = User().getAuthorizationHeader()
assert authorization_header


def graphqlQuery(body) -> dict:
    r = requests.post(f'{GQL_SERVER}/graphql/',
                      headers=authorization_header,
                      json={
                          "query": body
                      },
                      verify=False)
    if __debug__:
        print(r.text)
    return json.loads(r.text)["data"]


class Workspace:
    def __init__(self, name=None) -> None:
        self._list = graphqlQuery("""{
            listWorkspaces {
                name
                objectId
                channelId
                members
            }
        }""")["listWorkspaces"]
        self.select(name)

    def getNameList(self) -> List[str]:
        return list(map(lambda x: x["name"], self._list))

    def select(self, name):
        for w in self._list:
            if name == w["name"]:
                self._data = w
                break
        else:
            self._data = self._list[0]
        assert self._data
        return self

    def getName(self) -> str:
        return self._data["name"]

    def getId(self) -> str:
        return self._data["objectId"]

    def getGeneralChannelId(self) -> str:
        return self._data["channelId"]


class Channel:
    def __init__(self, workspaceId, name=None) -> None:
        self._list = graphqlQuery(f"""{{
            listChannels(workspaceId: "{workspaceId}") {{
                name
                objectId
                announcementSubscribers
                announcementPublishers
            }}
        }}""")["listChannels"]
        self.select(name)

    def getNameList(self) -> List[str]:
        return list(map(lambda x: x["name"], self._list))

    def select(self, name):
        for w in self._list:
            if name == w["name"]:
                self._data = w
                break
        else:
            self._data = self._list[0]
        assert self._data
        return self

    def getName(self) -> str:
        return self._data["name"]

    def getId(self) -> str:
        return self._data["objectId"]

    def getAnnouncementSubscribers(self) -> List[str]:
        return self._data["announcementSubscribers"]

    def getAnnouncementPublishers(self) -> List[str]:
        return self._data["announcementPublishers"]
