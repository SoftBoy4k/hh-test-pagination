import Head from "next/head";
import {Inter} from "next/font/google";
import Table from "react-bootstrap/Table";
import {Alert, Container} from "react-bootstrap";
import {GetServerSideProps, GetServerSidePropsContext} from "next";
import { useState } from "react";

const inter = Inter({subsets: ["latin"]});

type TUserItem = {
  id: number
  firstname: string
  lastname: string
  email: string
  phone: string
  updatedAt: string
}

type TGetServerSideProps = {
  statusCode: number
  users: TUserItem[]
}


export const getServerSideProps = (async (ctx: GetServerSidePropsContext): Promise<{ props: TGetServerSideProps }> => {
  try {
    const res = await fetch("http://localhost:3000/users", {method: 'GET'})
    if (!res.ok) {
      return {props: {statusCode: res.status, users: []}}
    }

    return {
      props: {statusCode: 200, users: await res.json()}
    }
  } catch (e) {
    return {props: {statusCode: 500, users: []}}
  }
}) satisfies GetServerSideProps<TGetServerSideProps>


export default function Home({statusCode, users}: TGetServerSideProps) {

  const [page, setPage] = useState<number>(1);

  const NUMBER_OF_ELEMENTS_ON_ONE_PAGE: number = 20;
  const NUMBER_OF_PAGES_ON_ONE_PAGE: number = 10; 
  const NUMBER_OF_LAST_PAGE: number = Math.ceil(users.length / NUMBER_OF_ELEMENTS_ON_ONE_PAGE);

  const currentPages = [];

  if (page + NUMBER_OF_PAGES_ON_ONE_PAGE <= NUMBER_OF_LAST_PAGE) {
    for (let index = page; index < NUMBER_OF_PAGES_ON_ONE_PAGE + page; index++) {
      currentPages.push(index);
    }
  } else {
    for (let index = NUMBER_OF_LAST_PAGE - 9; index <= NUMBER_OF_LAST_PAGE; index++) {
      currentPages.push(index);
    }
  }

  if (statusCode !== 200) {
    return <Alert variant={'danger'}>Ошибка {statusCode} при загрузке данных</Alert>
  }

  const changePage = (currentPage: number) => {
    setPage(currentPage);
  }

  const nextPage = (step: number = 1): void => {
    if (page + step <= Math.ceil(users.length / NUMBER_OF_ELEMENTS_ON_ONE_PAGE)) {
      changePage(page + step);
    }
  }

  const prevPage = (step: number = 1): void => {
    if (page - step > 0) {
      changePage(page - step);
    } else {
      changePage(1);
    }
  }

  return (
    <>
      <Head>
        <title>Тестовое задание</title>
        <meta name="description" content="Тестовое задание"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <link rel="icon" href="/favicon.ico"/>
      </Head>

      <main className={inter.className}>
        <Container>
          <h1 className={'mb-5'}>Пользователи</h1>

          <Table striped bordered hover>
            <thead>
            <tr>
              <th>ID</th>
              <th>Имя</th>
              <th>Фамилия</th>
              <th>Телефон</th>
              <th>Email</th>
              <th>Дата обновления</th>
            </tr>
            </thead>
            <tbody>
            {
              users.map((user) => 
                (
                user.id > (page - 1) * NUMBER_OF_ELEMENTS_ON_ONE_PAGE && 
                user.id <=  page * NUMBER_OF_ELEMENTS_ON_ONE_PAGE
                ) ? (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.firstname}</td>
                  <td>{user.lastname}</td>
                  <td>{user.phone}</td>
                  <td>{user.email}</td>
                  <td>{user.updatedAt}</td>
                </tr>
              ) : undefined)
            }
            </tbody>
          </Table>

          {/*TODO add pagination*/
          <nav aria-label="Page navigation example" style={{cursor: 'pointer'}}>
            <ul className="pagination">
              <li className="page-item" onClick={() => prevPage(10)}>
                <a className="page-link"aria-label="Previous">
                  <span aria-hidden="true">&laquo;</span>
                </a>
              </li>
              <li className="page-item" onClick={() => prevPage()}>
                <a className="page-link"aria-label="Previous">
                  <span aria-hidden="true">&lt;</span>
                </a>
              </li>
              {
                currentPages.map(el => (
                <li 
                  className={el === page ? "page-item active" : "page-item"} 
                  key={el}
                  onClick={() => changePage(el)}
                >
                  <a className="page-link">{el}</a>
                </li>
              ))
              }
              <li className="page-item" onClick={() => nextPage()}>
                <a className="page-link" aria-label="Previous">
                  <span aria-hidden="true">&gt;</span>
                </a>
              </li>
              <li className="page-item" onClick={() => nextPage(10)}>
                <a className="page-link" aria-label="Next">
                  <span aria-hidden="true">&raquo;</span>
                </a>
              </li>
            </ul>
          </nav>
          }

        </Container>
      </main>
    </>
  );
}
