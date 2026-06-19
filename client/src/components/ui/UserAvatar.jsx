function UserAvatar({ name, src, size = "md" }) {
  const sizes = {
    sm: "h-10 w-10 text-sm rounded-2xl",
    md: "h-14 w-14 text-xl rounded-2xl",
    lg: "h-24 w-24 text-4xl rounded-3xl"
  };

  const className = sizes[size] || sizes.md;

  if (src) {
    return (
      <img
        src={src}
        alt={name || "User"}
        className={`${className} shrink-0 border border-white/10 object-cover`}
      />
    );
  }

  return (
    <div
      className={`${className} flex shrink-0 items-center justify-center border border-blue-400/20 bg-gradient-to-br from-blue-500 to-blue-700 font-black text-white shadow-lg shadow-blue-500/20`}
    >
      {name?.charAt(0)?.toUpperCase() || "U"}
    </div>
  );
}

export default UserAvatar;
