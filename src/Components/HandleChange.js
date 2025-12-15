export const handleChange = (e, setSections) => {
  const { name, value } = e.target;
  setSections((p) => ({ ...p, [name]: value }));
};
