import { useAuth, useUser } from '@clerk/clerk-react'
import { supabase } from '../lib/supabase'
import { useState } from 'react'

export function DebugCheck() {
    const { isSignedIn, userId } = useAuth()
    const { user } = useUser()
    const [supabaseUser, setSupabaseUser] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    const checkSupabase = async () => {
        setLoading(true)
        try {
            if (!userId) {
                console.error('❌ User not logged in')
                return
            }
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single()
            if (error) {
                console.error('❌ Supabase:', error.message)
                setSupabaseUser({ error: error.message })
            } else {
                console.log('✅ Supabase user:', data)
                setSupabaseUser(data)
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px', fontFamily: 'monospace', fontSize: '0.8rem' }}>
            <h2>デバッグ確認</h2>

            {/* Clerk 認証情報 */}
            <div style={{ marginBottom: '16px', padding: '8px', background: '#f0f0f0', borderRadius: '4px' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem' }}>Clerk 認証情報</h3>
                <p style={{ margin: '4px 0' }}>ログイン状態: {isSignedIn ? '✅' : '❌'}</p>
                <p style={{ margin: '4px 0' }}>User ID: {userId ?? 'なし'}</p>
                {user && (
                    <>
                        <p style={{ margin: '4px 0' }}>Email: {user.emailAddresses[0]?.emailAddress ?? 'なし'}</p>
                        <p style={{ margin: '4px 0' }}>Name: {user.firstName ?? ''} {user.lastName ?? ''}</p>
                        <p style={{ margin: '4px 0' }}>Username: {user.username ?? 'なし'}</p>
                    </>
                )}
            </div>

            {/* Supabase ユーザー情報 */}
            <div style={{ marginBottom: '16px', padding: '8px', background: '#e0f0e0', borderRadius: '4px' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem' }}>Supabase usersテーブル</h3>
                <button
                    onClick={checkSupabase}
                    disabled={!isSignedIn || loading}
                    style={{
                        padding: '8px 16px',
                        background: isSignedIn && !loading ? '#4CAF50' : '#ccc',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: isSignedIn && !loading ? 'pointer' : 'not-allowed',
                    }}
                >
                    {loading ? '取得中...' : isSignedIn ? 'Supabaseユーザー情報取得' : 'ログインが必要'}
                </button>

                {supabaseUser && (
                    <div style={{ marginTop: '8px', padding: '8px', background: 'white', borderRadius: '4px', fontSize: '0.75rem' }}>
                        {supabaseUser.error ? (
                            <p style={{ color: 'red', margin: '4px 0' }}>エラー: {supabaseUser.error}</p>
                        ) : (
                            <>
                                <p style={{ margin: '4px 0' }}>✅ ユーザーが見つかりました</p>
                                <p style={{ margin: '4px 0' }}>ID: {supabaseUser.id}</p>
                                <p style={{ margin: '4px 0' }}>Email: {supabaseUser.email}</p>
                                <p style={{ margin: '4px 0' }}>Name: {supabaseUser.first_name} {supabaseUser.last_name}</p>
                                <p style={{ margin: '4px 0' }}>Last Synced: {supabaseUser.last_synced_at ?? '未同期'}</p>
                                <p style={{ margin: '4px 0' }}>Email Verified: {supabaseUser.email_verified ? '✅' : '❌'}</p>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}