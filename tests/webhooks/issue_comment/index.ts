import { makeLambdaEvent } from "../../lambda_event";

type ArgType = {
  orgName: string;
};

const GH_EVENT_NAME = "issue_comment";

export const makeIssueCommentEvent = ({ orgName }: ArgType) => {
  return makeLambdaEvent(GH_EVENT_NAME, {
    action: "created",
    issue: {
      url: "https://api.github.com/repos/nv-morpheus/ops-gha-tests/issues/1",
      repository_url: "https://api.github.com/repos/nv-morpheus/ops-gha-tests",
      labels_url:
        "https://api.github.com/repos/nv-morpheus/ops-gha-tests/issues/1/labels{/name}",
      comments_url:
        "https://api.github.com/repos/nv-morpheus/ops-gha-tests/issues/1/comments",
      events_url:
        "https://api.github.com/repos/nv-morpheus/ops-gha-tests/issues/1/events",
      html_url: "https://github.com/nv-morpheus/ops-gha-tests/issues/1",
      id: 1533974064,
      node_id: "I_kwDOHZ5Rwc5bbpYw",
      number: 1,
      title: "Test Issue",
      user: {
        login: "ajschmidt8",
        id: 7400326,
        node_id: "MDQ6VXNlcjc0MDAzMjY=",
        avatar_url: "https://avatars.githubusercontent.com/u/7400326?v=4",
        gravatar_id: "",
        url: "https://api.github.com/users/ajschmidt8",
        html_url: "https://github.com/ajschmidt8",
        followers_url: "https://api.github.com/users/ajschmidt8/followers",
        following_url:
          "https://api.github.com/users/ajschmidt8/following{/other_user}",
        gists_url: "https://api.github.com/users/ajschmidt8/gists{/gist_id}",
        starred_url:
          "https://api.github.com/users/ajschmidt8/starred{/owner}{/repo}",
        subscriptions_url:
          "https://api.github.com/users/ajschmidt8/subscriptions",
        organizations_url: "https://api.github.com/users/ajschmidt8/orgs",
        repos_url: "https://api.github.com/users/ajschmidt8/repos",
        events_url: "https://api.github.com/users/ajschmidt8/events{/privacy}",
        received_events_url:
          "https://api.github.com/users/ajschmidt8/received_events",
        type: "User",
        site_admin: false,
      },
      labels: [],
      state: "open",
      locked: false,
      assignee: null,
      assignees: [],
      milestone: null,
      comments: 4,
      created_at: "2023-01-15T19:49:40Z",
      updated_at: "2023-01-16T00:56:19Z",
      closed_at: null,
      author_association: "CONTRIBUTOR",
      active_lock_reason: null,
      body: "An issue created for testing purposes.",
      reactions: {
        url: "https://api.github.com/repos/nv-morpheus/ops-gha-tests/issues/1/reactions",
        total_count: 0,
        "+1": 0,
        "-1": 0,
        laugh: 0,
        hooray: 0,
        confused: 0,
        heart: 0,
        rocket: 0,
        eyes: 0,
      },
      timeline_url:
        "https://api.github.com/repos/nv-morpheus/ops-gha-tests/issues/1/timeline",
      performed_via_github_app: null,
      state_reason: null,
    },
    comment: {
      url: "https://api.github.com/repos/nv-morpheus/ops-gha-tests/issues/comments/1383313045",
      html_url:
        "https://github.com/nv-morpheus/ops-gha-tests/issues/1#issuecomment-1383313045",
      issue_url:
        "https://api.github.com/repos/nv-morpheus/ops-gha-tests/issues/1",
      id: 1383313045,
      node_id: "IC_kwDOHZ5Rwc5Sc66V",
      user: {
        login: "ajschmidt8",
        id: 7400326,
        node_id: "MDQ6VXNlcjc0MDAzMjY=",
        avatar_url: "https://avatars.githubusercontent.com/u/7400326?v=4",
        gravatar_id: "",
        url: "https://api.github.com/users/ajschmidt8",
        html_url: "https://github.com/ajschmidt8",
        followers_url: "https://api.github.com/users/ajschmidt8/followers",
        following_url:
          "https://api.github.com/users/ajschmidt8/following{/other_user}",
        gists_url: "https://api.github.com/users/ajschmidt8/gists{/gist_id}",
        starred_url:
          "https://api.github.com/users/ajschmidt8/starred{/owner}{/repo}",
        subscriptions_url:
          "https://api.github.com/users/ajschmidt8/subscriptions",
        organizations_url: "https://api.github.com/users/ajschmidt8/orgs",
        repos_url: "https://api.github.com/users/ajschmidt8/repos",
        events_url: "https://api.github.com/users/ajschmidt8/events{/privacy}",
        received_events_url:
          "https://api.github.com/users/ajschmidt8/received_events",
        type: "User",
        site_admin: false,
      },
      created_at: "2023-01-16T00:56:18Z",
      updated_at: "2023-01-16T00:56:18Z",
      author_association: "CONTRIBUTOR",
      body: "A comment",
      reactions: {
        url: "https://api.github.com/repos/nv-morpheus/ops-gha-tests/issues/comments/1383313045/reactions",
        total_count: 0,
        "+1": 0,
        "-1": 0,
        laugh: 0,
        hooray: 0,
        confused: 0,
        heart: 0,
        rocket: 0,
        eyes: 0,
      },
      performed_via_github_app: null,
    },
    repository: {
      id: 496914881,
      node_id: "R_kgDOHZ5RwQ",
      name: "ops-gha-tests",
      full_name: "nv-morpheus/ops-gha-tests",
      private: true,
      owner: {
        login: "nv-morpheus",
        id: 104869010,
        node_id: "O_kgDOBkAskg",
        avatar_url: "https://avatars.githubusercontent.com/u/104869010?v=4",
        gravatar_id: "",
        url: "https://api.github.com/users/nv-morpheus",
        html_url: "https://github.com/nv-morpheus",
        followers_url: "https://api.github.com/users/nv-morpheus/followers",
        following_url:
          "https://api.github.com/users/nv-morpheus/following{/other_user}",
        gists_url: "https://api.github.com/users/nv-morpheus/gists{/gist_id}",
        starred_url:
          "https://api.github.com/users/nv-morpheus/starred{/owner}{/repo}",
        subscriptions_url:
          "https://api.github.com/users/nv-morpheus/subscriptions",
        organizations_url: "https://api.github.com/users/nv-morpheus/orgs",
        repos_url: "https://api.github.com/users/nv-morpheus/repos",
        events_url: "https://api.github.com/users/nv-morpheus/events{/privacy}",
        received_events_url:
          "https://api.github.com/users/nv-morpheus/received_events",
        type: "Organization",
        site_admin: false,
      },
      html_url: "https://github.com/nv-morpheus/ops-gha-tests",
      description:
        "Temporary repository used by RAPIDS ops team to test GitHub Actions",
      fork: false,
      url: "https://api.github.com/repos/nv-morpheus/ops-gha-tests",
      forks_url: "https://api.github.com/repos/nv-morpheus/ops-gha-tests/forks",
      keys_url:
        "https://api.github.com/repos/nv-morpheus/ops-gha-tests/keys{/key_id}",
      collaborators_url:
        "https://api.github.com/repos/nv-morpheus/ops-gha-tests/collaborators{/collaborator}",
      teams_url: "https://api.github.com/repos/nv-morpheus/ops-gha-tests/teams",
      hooks_url: "https://api.github.com/repos/nv-morpheus/ops-gha-tests/hooks",
      issue_events_url:
        "https://api.github.com/repos/nv-morpheus/ops-gha-tests/issues/events{/number}",
      events_url:
        "https://api.github.com/repos/nv-morpheus/ops-gha-tests/events",
      assignees_url:
        "https://api.github.com/repos/nv-morpheus/ops-gha-tests/assignees{/user}",
      branches_url:
        "https://api.github.com/repos/nv-morpheus/ops-gha-tests/branches{/branch}",
      tags_url: "https://api.github.com/repos/nv-morpheus/ops-gha-tests/tags",
      blobs_url:
        "https://api.github.com/repos/nv-morpheus/ops-gha-tests/git/blobs{/sha}",
      git_tags_url:
        "https://api.github.com/repos/nv-morpheus/ops-gha-tests/git/tags{/sha}",
      git_refs_url:
        "https://api.github.com/repos/nv-morpheus/ops-gha-tests/git/refs{/sha}",
      trees_url:
        "https://api.github.com/repos/nv-morpheus/ops-gha-tests/git/trees{/sha}",
      statuses_url:
        "https://api.github.com/repos/nv-morpheus/ops-gha-tests/statuses/{sha}",
      languages_url:
        "https://api.github.com/repos/nv-morpheus/ops-gha-tests/languages",
      stargazers_url:
        "https://api.github.com/repos/nv-morpheus/ops-gha-tests/stargazers",
      contributors_url:
        "https://api.github.com/repos/nv-morpheus/ops-gha-tests/contributors",
      subscribers_url:
        "https://api.github.com/repos/nv-morpheus/ops-gha-tests/subscribers",
      subscription_url:
        "https://api.github.com/repos/nv-morpheus/ops-gha-tests/subscription",
      commits_url:
        "https://api.github.com/repos/nv-morpheus/ops-gha-tests/commits{/sha}",
      git_commits_url:
        "https://api.github.com/repos/nv-morpheus/ops-gha-tests/git/commits{/sha}",
      comments_url:
        "https://api.github.com/repos/nv-morpheus/ops-gha-tests/comments{/number}",
      issue_comment_url:
        "https://api.github.com/repos/nv-morpheus/ops-gha-tests/issues/comments{/number}",
      contents_url:
        "https://api.github.com/repos/nv-morpheus/ops-gha-tests/contents/{+path}",
      compare_url:
        "https://api.github.com/repos/nv-morpheus/ops-gha-tests/compare/{base}...{head}",
      merges_url:
        "https://api.github.com/repos/nv-morpheus/ops-gha-tests/merges",
      archive_url:
        "https://api.github.com/repos/nv-morpheus/ops-gha-tests/{archive_format}{/ref}",
      downloads_url:
        "https://api.github.com/repos/nv-morpheus/ops-gha-tests/downloads",
      issues_url:
        "https://api.github.com/repos/nv-morpheus/ops-gha-tests/issues{/number}",
      pulls_url:
        "https://api.github.com/repos/nv-morpheus/ops-gha-tests/pulls{/number}",
      milestones_url:
        "https://api.github.com/repos/nv-morpheus/ops-gha-tests/milestones{/number}",
      notifications_url:
        "https://api.github.com/repos/nv-morpheus/ops-gha-tests/notifications{?since,all,participating}",
      labels_url:
        "https://api.github.com/repos/nv-morpheus/ops-gha-tests/labels{/name}",
      releases_url:
        "https://api.github.com/repos/nv-morpheus/ops-gha-tests/releases{/id}",
      deployments_url:
        "https://api.github.com/repos/nv-morpheus/ops-gha-tests/deployments",
      created_at: "2022-05-27T08:15:16Z",
      updated_at: "2022-05-27T08:15:19Z",
      pushed_at: "2022-08-02T12:17:03Z",
      git_url: "git://github.com/nv-morpheus/ops-gha-tests.git",
      ssh_url: "git@github.com:nv-morpheus/ops-gha-tests.git",
      clone_url: "https://github.com/nv-morpheus/ops-gha-tests.git",
      svn_url: "https://github.com/nv-morpheus/ops-gha-tests",
      homepage: null,
      size: 2,
      stargazers_count: 0,
      watchers_count: 0,
      language: null,
      has_issues: true,
      has_projects: true,
      has_downloads: true,
      has_wiki: true,
      has_pages: false,
      has_discussions: false,
      forks_count: 0,
      mirror_url: null,
      archived: false,
      disabled: false,
      open_issues_count: 1,
      license: null,
      allow_forking: false,
      is_template: false,
      web_commit_signoff_required: false,
      topics: [],
      visibility: "private",
      forks: 0,
      open_issues: 1,
      watchers: 0,
      default_branch: "main",
    },
    organization: {
      login: orgName,
      id: 104869010,
      node_id: "O_kgDOBkAskg",
      url: "https://api.github.com/orgs/nv-morpheus",
      repos_url: "https://api.github.com/orgs/nv-morpheus/repos",
      events_url: "https://api.github.com/orgs/nv-morpheus/events",
      hooks_url: "https://api.github.com/orgs/nv-morpheus/hooks",
      issues_url: "https://api.github.com/orgs/nv-morpheus/issues",
      members_url: "https://api.github.com/orgs/nv-morpheus/members{/member}",
      public_members_url:
        "https://api.github.com/orgs/nv-morpheus/public_members{/member}",
      avatar_url: "https://avatars.githubusercontent.com/u/104869010?v=4",
      description: "",
    },
    sender: {
      login: "ajschmidt8",
      id: 7400326,
      node_id: "MDQ6VXNlcjc0MDAzMjY=",
      avatar_url: "https://avatars.githubusercontent.com/u/7400326?v=4",
      gravatar_id: "",
      url: "https://api.github.com/users/ajschmidt8",
      html_url: "https://github.com/ajschmidt8",
      followers_url: "https://api.github.com/users/ajschmidt8/followers",
      following_url:
        "https://api.github.com/users/ajschmidt8/following{/other_user}",
      gists_url: "https://api.github.com/users/ajschmidt8/gists{/gist_id}",
      starred_url:
        "https://api.github.com/users/ajschmidt8/starred{/owner}{/repo}",
      subscriptions_url:
        "https://api.github.com/users/ajschmidt8/subscriptions",
      organizations_url: "https://api.github.com/users/ajschmidt8/orgs",
      repos_url: "https://api.github.com/users/ajschmidt8/repos",
      events_url: "https://api.github.com/users/ajschmidt8/events{/privacy}",
      received_events_url:
        "https://api.github.com/users/ajschmidt8/received_events",
      type: "User",
      site_admin: false,
    },
    installation: {
      id: 33169462,
      node_id: "MDIzOkludGVncmF0aW9uSW5zdGFsbGF0aW9uMzMxNjk0NjI=",
    },
  });
};
