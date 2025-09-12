
export const getUser = (req, res, next) => {
  const { user } = req;
  return res.status(200).json({ success: true, user });
}