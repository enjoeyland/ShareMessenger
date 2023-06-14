import json
import requests
from typing import List
import private

GQL_SERVER = 'http://localhost:4000'
API_URL = 'http://localhost:4001'


class ShareMessenger:
    def __init__(self, email=private.EMAIL, password=private.PASSWORD) -> None:
        self.email = email
        self.password = password
        self.user = self.User(self)
        self.authorization_header = self.user.getAuthorizationHeader()
        assert self.authorization_header
        self.workspace = self.Workspace(self)

    class User:
        def __init__(self, sharemessenger) -> None:
            self._sm = sharemessenger
            r = requests.post(f'{GQL_SERVER}/auth/login',
                              json={"email": self._sm.email,
                                    "password": self._sm.password},
                              verify=False)

            if __debug__:
                print(r.text)
            self._data = json.loads(r.text)

        def getUserId(self) -> str:
            return self._data["uid"]

        def getAuthorizationHeader(self) -> str:
            return {"authorization": f"Bearer {self._data['idToken']}"}

    def graphqlQuery(self, body) -> dict:
        r = requests.post(f'{GQL_SERVER}/graphql/',
                          headers=self.authorization_header,
                          json={
                              "query": body
                          },
                          verify=False)
        if __debug__:
            print(r.text)
        return json.loads(r.text)["data"]

    class Workspace:
        def __init__(self, sharemessenger) -> None:
            self._sm = sharemessenger
            self._list = self._sm.graphqlQuery("""{
                listWorkspaces {
                    name
                    objectId
                    channelId
                    members
                }
            }""")["listWorkspaces"]
            self.select(None)

        def getNameList(self) -> List[str]:
            return list(map(lambda x: x["name"], self._list))

        def select(self, name):
            if not name:
                self._data = self._list[0]
                return self
            for w in self._list:
                if name == w["name"]:
                    self._data = w
                    break
            else:
                raise Exception(f"There is such a workspace name {name}.")
            return self

        def getName(self) -> str:
            return self._data["name"]

        def getId(self) -> str:
            return self._data["objectId"]

        def getGeneralChannelId(self) -> str:
            return self._data["channelId"]

    def getChannel(self, workspaceId):
        self.channel = self.Channel(self, workspaceId)
        return self.channel

    class Channel:
        def __init__(self, sharemessenger, workspaceId) -> None:
            self._sm = sharemessenger
            self.workspaceId = workspaceId
            self.refresh()
            self.select(None)

        def refresh(self):
            self._list = self._sm.graphqlQuery(f"""{{
                listChannels(workspaceId: "{self.workspaceId}") {{
                    name
                    objectId
                    announcementSubscribers
                    announcementPublishers
                }}
            }}""")["listChannels"]

        def getNameList(self) -> List[str]:
            return list(map(lambda x: x["name"], self._list))

        def create(self, name):
            if not name:
                return
            r = requests.post(f'{API_URL}/channels/',
                              headers=self._sm.authorization_header,
                              json={
                                  "name": name,
                                  "workspaceId": self.workspaceId,
                              },
                              verify=False)
            if __debug__:
                print(r.text)

        def select(self, name, create=False):
            if not name:
                self._data = self._list[0]
                return self
            for w in self._list:
                if name == w["name"]:
                    self._data = w
                    return self
            else:
                if create:
                    self.create(name)
                    self.refresh()
                    return self.select(name)
                else:
                    raise Exception(f"There is such a channel name {name}.")

        def getName(self) -> str:
            return self._data["name"]

        def getId(self) -> str:
            return self._data["objectId"]

        def getAnnouncementSubscribers(self) -> List[str]:
            return self._data["announcementSubscribers"]

        def getAnnouncementPublishers(self) -> List[str]:
            return self._data["announcementPublishers"]
