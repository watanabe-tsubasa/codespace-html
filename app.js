const { createClient } = supabase;
let supabaseClient;

// 投稿をリストに追加する関数
function addPostToList(post, prepend = false) {
  const postsContainer = document.getElementById('posts');
  const postElement = document.createElement('div');
  postElement.className = 'card post-card';
  postElement.innerHTML = `
    <div class="card-body">
      <h5 class="card-title">${escapeHTML(post.username)}</h5>
      <p class="card-text">${escapeHTML(post.message)}</p>
      <p class="card-text"><small class="text-muted">${new Date(post.created_at).toLocaleString()}</small></p>
    </div>
  `;
  if (prepend) {
    postsContainer.prepend(postElement);
  } else {
    postsContainer.appendChild(postElement);
  }
}

// 投稿を読み込んで表示する関数
async function fetchPosts() {
  try {
    const { data: posts, error } = await supabaseClient
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const postsContainer = document.getElementById('posts');
    postsContainer.innerHTML = ''; // クリア
    posts.forEach(post => addPostToList(post));

  } catch (error) {
    console.error('Fetch error:', error);
    const postsContainer = document.getElementById('posts');
    postsContainer.innerHTML = '<p class="text-danger">投稿の読み込みに失敗しました。</p>';
  }
}

// フォームの送信イベントを処理
document.getElementById('post-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const usernameInput = document.getElementById('username');
  const messageInput = document.getElementById('message');
  const username = usernameInput.value;
  const message = messageInput.value;

  if (!message) {
    alert('メッセージを入力してください。');
    return;
  }

  try {
    const { error } = await supabaseClient
      .from('posts')
      .insert([{ username: username || '名無しさん', message }]);

    if (error) throw error;

    // フォームをクリア
    usernameInput.value = '';
    messageInput.value = '';

  } catch (error) {
    console.error('Submit error:', error);
    alert('投稿に失敗しました。');
  }
});

// HTMLエスケープ用のヘルパー関数
function escapeHTML(str) {
  return str.replace(/[&<>"'/]/g, match => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '\'': '&#39;',
    '"': '&quot;',
    '/': '&#x2F;'
  }[match] || ''));
}

// Supabaseを初期化してリアルタイムリスナーを設定
async function initialize() {
  try {
    const response = await fetch('/config');
    const config = await response.json();
    supabaseClient = createClient(config.supabaseUrl, config.supabaseKey);

    await fetchPosts();

    supabaseClient
      .channel('public:posts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, payload => {
        addPostToList(payload.new, true);
      })
      .subscribe();

  } catch (error) {
    console.error('Initialization failed:', error);
  }
}

// ページ読み込み時に初期化
document.addEventListener('DOMContentLoaded', initialize);