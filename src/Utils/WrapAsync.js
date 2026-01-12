export const WrapAsync = (func, setMsg, setMsgType) => {
    return async function (...arg) {
        try {
            const res = await func(...arg)
            if (res?.data?.message && setMsg) setMsg(res?.data?.message)
            if (setMsgType) setMsgType("success")
        } catch (e) {
            console.log("front error: ", e?.message)
            if (setMsg) setMsg(e?.response?.data?.message || "Something Went Wrong")
            if (setMsgType) setMsgType("danger")
        }
    }
}