require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// --- ここにSupabaseの情報を入力してください ---
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
// -----------------------------------------

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('Supabaseへの接続をテストしています...');

  // 'posts'テーブルからデータを取得
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .limit(5); // 念のため5件に制限

  if (error) {
    console.error('エラーが発生しました:');
    console.error(error);
    console.log('\n---');
    console.log('考えられる原因:');
    console.log('1. SupabaseのURLまたはKeyが間違っている。');
    console.log('2. `posts`テーブルが存在しない (SQLで作成しましたか？)');
    console.log('3. ネットワーク接続に問題がある。');

  } else {
    console.log('接続に成功しました！');
    console.log('取得したデータ:');
    if (data.length === 0) {
      console.log('(テーブルは空です)');
    } else {
      console.log(data);
    }
  }
}

testConnection();
