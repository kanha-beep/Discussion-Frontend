export const handleChange = (e, setForm) => {
  const { name, value } = e.target;
  setForm((p) => ({ ...p, [name]: value }));
};
