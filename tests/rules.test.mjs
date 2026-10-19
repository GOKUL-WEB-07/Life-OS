import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
const project = "demo-project-os";
const base =
  "http://127.0.0.1:8080/v1/projects/" +
  project +
  "/databases/(default)/documents";
const documentName = (collection, id) =>
  "projects/" +
  project +
  "/databases/(default)/documents/" +
  collection +
  "/" +
  id;
const fields = (data) =>
  Object.fromEntries(
    Object.entries(data).map(([key, value]) => [
      key,
      value === null
        ? { nullValue: null }
        : typeof value === "boolean"
          ? { booleanValue: value }
          : typeof value === "number"
            ? { integerValue: String(value) }
            : { stringValue: value },
    ]),
  );
async function identity() {
  const response = await fetch(
    "http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=emulator-key",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: randomUUID() + "@projectos.test",
        password: "disposable-emulator-password",
        returnSecureToken: true,
      }),
    },
  );
  assert.equal(response.status, 200, "Authentication emulator must be running");
  return response.json();
}
async function request(path, user, method = "GET", body) {
  return fetch(path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(user ? { Authorization: "Bearer " + user.idToken } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}
function write(collection, id, data, updateMask) {
  return {
    update: { name: documentName(collection, id), fields: fields(data) },
    ...(updateMask ? { updateMask: { fieldPaths: updateMask } } : {}),
    updateTransforms: [
      { fieldPath: "updatedAt", setToServerValue: "REQUEST_TIME" },
      ...(!updateMask
        ? [{ fieldPath: "createdAt", setToServerValue: "REQUEST_TIME" }]
        : []),
    ],
  };
}
test("Firestore ownership and integrity rules against disposable emulators", async (t) => {
  let alice, bob;
  try {
    alice = await identity();
    bob = await identity();
  } catch (error) {
    throw new Error(
      "Start Auth and Firestore emulators with project demo-project-os before running test:rules. " +
        error.message,
    );
  }
  const areaId = randomUUID(),
    projectId = randomUUID();
  const fixtures = {
    areas: {
      id: areaId,
      data: {
        userId: alice.localId,
        name: "Test area",
        color: "#5271bc",
        order: 0,
        archived: false,
      },
    },
    projects: {
      id: projectId,
      data: {
        userId: alice.localId,
        name: "Test project",
        areaId,
        description: "",
        status: "active",
        priority: "medium",
        startDate: "",
        deadline: "",
        progress: 0,
      },
    },
    tasks: {
      id: randomUUID(),
      data: {
        userId: alice.localId,
        title: "Test task",
        description: "",
        projectId,
        areaId,
        status: "todo",
        priority: "medium",
        dueDate: "",
        scheduledDate: "",
        scheduledStart: "",
        scheduledEnd: "",
        estimatedMinutes: 0,
        completed: false,
        completedAt: null,
      },
    },
    inboxItems: {
      id: randomUUID(),
      data: { userId: alice.localId, text: "Test inbox", type: "unprocessed" },
    },
    calendarEvents: {
      id: randomUUID(),
      data: {
        userId: alice.localId,
        title: "Test event",
        date: "2026-10-08",
        startTime: "",
        endTime: "",
        allDay: true,
        description: "",
      },
    },
    reminders: {
      id: randomUUID(),
      data: {
        userId: alice.localId,
        title: "Test reminder",
        date: "2026-10-08",
        time: "",
        completed: false,
      },
    },
  };
  for (const [collection, fixture] of Object.entries(fixtures)) {
    await t.test(
      collection + ": owner allowed, others denied, ownership immutable",
      async () => {
        let result = await request(base + ":commit", alice, "POST", {
          writes: [write(collection, fixture.id, fixture.data)],
        });
        assert.equal(result.status, 200, await result.text());
        assert.equal(
          (await request(base + "/" + collection + "/" + fixture.id, alice))
            .status,
          200,
        );
        assert.equal(
          (await request(base + "/" + collection + "/" + fixture.id, bob))
            .status,
          403,
        );
        assert.equal(
          (await request(base + "/" + collection + "/" + fixture.id, null))
            .status,
          403,
        );
        assert.equal(
          (
            await request(
              base + "/" + collection + "/" + fixture.id,
              bob,
              "DELETE",
            )
          ).status,
          403,
        );
        assert.equal(
          (
            await request(base + ":commit", bob, "POST", {
              writes: [write(collection, randomUUID(), fixture.data)],
            })
          ).status,
          403,
        );
        assert.equal(
          (
            await request(base + ":commit", alice, "POST", {
              writes: [
                write(collection, fixture.id, { userId: bob.localId }, [
                  "userId",
                ]),
              ],
            })
          ).status,
          403,
        );
      },
    );
  }
  await t.test(
    "user profile is accessible only at the authenticated UID",
    async () => {
      assert.equal(
        (
          await request(base + ":commit", alice, "POST", {
            writes: [
              write("users", alice.localId, {
                displayName: "Alice",
                email: alice.email,
                initialized: true,
              }),
            ],
          })
        ).status,
        200,
      );
      assert.equal(
        (await request(base + "/users/" + alice.localId, bob)).status,
        403,
      );
      assert.equal(
        (
          await request(base + ":commit", bob, "POST", {
            writes: [
              write("users", alice.localId, { displayName: "Bob" }, [
                "displayName",
              ]),
            ],
          })
        ).status,
        403,
      );
    },
  );
  await t.test(
    "unscoped queries fail and user-scoped queries succeed",
    async () => {
      const query = { from: [{ collectionId: "tasks" }] };
      assert.equal(
        (
          await request(base + ":runQuery", alice, "POST", {
            structuredQuery: query,
          })
        ).status,
        403,
      );
      assert.equal(
        (
          await request(base + ":runQuery", alice, "POST", {
            structuredQuery: {
              ...query,
              where: {
                fieldFilter: {
                  field: { fieldPath: "userId" },
                  op: "EQUAL",
                  value: { stringValue: alice.localId },
                },
              },
            },
          })
        ).status,
        200,
      );
    },
  );
  await t.test(
    "project and area deletion is prohibited even for their owner",
    async () => {
      assert.equal(
        (await request(base + "/areas/" + areaId, alice, "DELETE")).status,
        403,
      );
      assert.equal(
        (await request(base + "/projects/" + projectId, alice, "DELETE"))
          .status,
        403,
      );
    },
  );
  await t.test(
    "cross-user task relations and inconsistent completion are rejected",
    async () => {
      assert.equal(
        (
          await request(base + ":commit", bob, "POST", {
            writes: [
              write("tasks", randomUUID(), {
                ...fixtures.tasks.data,
                userId: bob.localId,
              }),
            ],
          })
        ).status,
        403,
      );
      assert.equal(
        (
          await request(base + ":commit", alice, "POST", {
            writes: [
              write("tasks", randomUUID(), {
                ...fixtures.tasks.data,
                completed: true,
                status: "todo",
              }),
            ],
          })
        ).status,
        403,
      );
    },
  );
});
