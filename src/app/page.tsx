"use client";

import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import { App, Button, Flex, Input, Table, Typography } from "antd";
import { debounce } from "lodash";

const MAX_SEARCH_LENGTH = 100;
const DEBOUNCED_INPUT_WAIT_TIME_MS = 500;

export default function Home() {
  const [data, setData] = useState<IAdvocate[]>([]);
  const [search, setSearch] = useState("");
  const [paging, setPaging] = useState({ page: 1, limit: 10, total: 0 });
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");

  const { message } = App.useApp();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
              console.log(token)
      const response: {
        data: IAdvocate[];
        pagination: IPagination;
      } = await (

        await fetch(
          `/api/advocates?page=${paging.page}&limit=${
            paging.limit
          }&search=${encodeURIComponent(search)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        )
      ).json();
      setData(response.data);
      setPaging(response.pagination);
      setLoading(false);
    };
    if (token) fetchData();
  }, [paging.page, paging.limit, search, token]);

  const onDebouncedInputChange = useMemo(
    () => debounce((v: string) => setSearch(v), DEBOUNCED_INPUT_WAIT_TIME_MS),
    []
  );

  const onChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) =>
      onDebouncedInputChange(e.target.value),
    [onDebouncedInputChange]
  );

  const handleSignIn = useCallback(async () => {
    try {
      const response = await (
        await fetch(`/api/auth/login`, {
          method: "POST",
          body: JSON.stringify({
            username: "admin",
            password: "testadmin@1234",
          }),
        })
      ).json();
      setToken(response.token);
    } catch {
      message.error("Can't get token");
    }
  }, [message]);

  if (!token)
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Button size="large" type="primary" onClick={handleSignIn}>
          Sign in
        </Button>
      </div>
    );

  return (
    <main style={{ margin: "24px" }}>
      <Typography.Title level={2}>Solace Advocates</Typography.Title>
      <div>
        <Flex className="mb-4">
          <Input
            maxLength={MAX_SEARCH_LENGTH}
            placeholder="Enter search query"
            onChange={onChange}
          />
          <Button
            loading={loading}
            className="ml-4"
            onClick={() => setSearch("")}
          >
            Reset Search
          </Button>
        </Flex>
      </div>

      <p style={{ opacity: !!search ? 1 : 0 }}>
        Showing result for: <span id="search-term">{search}</span>
      </p>

      <Table
        rowKey="id"
        loading={loading}
        dataSource={data}
        onChange={(p) =>
          setPaging({
            limit: p.pageSize || 10,
            page: p.current || 1,
            total: paging.total,
          })
        }
        pagination={{
          current: paging.page,
          pageSize: paging.limit,
          total: 15,
          showSizeChanger: true,
        }}
        columns={[
          { title: "First Name", dataIndex: "firstName" },
          { title: "Last Name", dataIndex: "lastName" },
          { title: "City", dataIndex: "city" },
          { title: "Degree", dataIndex: "degree" },
          {
            title: "Specialities",
            dataIndex: "specialties",
            render: (specialties: string[]) => (
              <>
                {specialties.map((s) => (
                  <div key={s}>{s}</div>
                ))}
              </>
            ),
          },
          { title: "Years of Experience", dataIndex: "yearsOfExperience" },
          { title: "Phone Number", dataIndex: "phoneNumber" },
        ]}
      />
    </main>
  );
}
