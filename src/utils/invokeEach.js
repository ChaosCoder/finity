export default async function invokeEach(fns, ...args) {
  return await Promise.all(fns.map(fn => fn.bind(this)).map(async fn => (await fn(...args))));
}
